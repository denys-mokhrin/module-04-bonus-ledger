const IDENTIFIER = /^[a-z_][a-z0-9_]*$/;

/** A domain event as stored in the outbox and delivered on the bus. */
export interface DomainEvent<P = unknown> {
  eventId: string;
  type: string;
  occurredAt: Date;
  payload: P;
}

/** Any Prisma client or interactive-transaction client. */
export interface RawExecutor {
  $executeRawUnsafe(query: string, ...values: unknown[]): Promise<number>;
}

/** Any Prisma client that can open an interactive transaction. */
export interface TransactionalDb<Tx> {
  $transaction<R>(fn: (tx: Tx) => Promise<R>): Promise<R>;
}

export function quoteSchema(schema: string): string {
  if (!IDENTIFIER.test(schema)) {
    throw new Error(`Invalid schema identifier "${schema}"`);
  }
  return `"${schema}"`;
}

/** Writes the event to the context's outbox inside the caller's transaction. Idempotent by eventId. */
export async function writeToOutbox(tx: RawExecutor, schema: string, event: DomainEvent): Promise<void> {
  await tx.$executeRawUnsafe(
    `INSERT INTO ${quoteSchema(schema)}.outbox (event_id, event_type, payload, occurred_at)
     VALUES ($1::uuid, $2, $3::jsonb, $4::timestamptz)
     ON CONFLICT (event_id) DO NOTHING`,
    event.eventId,
    event.type,
    JSON.stringify(event.payload ?? null),
    event.occurredAt,
  );
}

/**
 * Runs the handler at most once per (consumer, eventId): the mark and the handler's writes
 * share one transaction, so a failing handler leaves the event unprocessed.
 */
export async function consumeOnce<Tx extends RawExecutor>(
  db: TransactionalDb<Tx>,
  schema: string,
  consumerName: string,
  event: DomainEvent,
  handler: (tx: Tx) => Promise<void>,
): Promise<boolean> {
  const table = `${quoteSchema(schema)}.processed_events`;
  return db.$transaction(async (tx) => {
    const inserted = await tx.$executeRawUnsafe(
      `INSERT INTO ${table} (consumer, event_id) VALUES ($1, $2::uuid) ON CONFLICT DO NOTHING`,
      consumerName,
      event.eventId,
    );
    if (inserted === 0) return false;
    await handler(tx);
    return true;
  });
}
