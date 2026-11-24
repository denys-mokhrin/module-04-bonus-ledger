-- Outbox and consumer-dedup tables of the identity context (scaffold task S9).
CREATE TABLE IF NOT EXISTS "identity".outbox (
  event_id     UUID         PRIMARY KEY,
  event_type   VARCHAR(200) NOT NULL,
  payload      JSONB        NOT NULL,
  occurred_at  TIMESTAMPTZ  NOT NULL,
  created_at   TIMESTAMPTZ  NOT NULL DEFAULT now(),
  published_at TIMESTAMPTZ  NULL
);

-- The relay's query: oldest unpublished rows first.
CREATE INDEX IF NOT EXISTS outbox_unpublished_created_at_idx
  ON "identity".outbox (created_at) WHERE published_at IS NULL;

CREATE TABLE IF NOT EXISTS "identity".processed_events (
  consumer   VARCHAR(200) NOT NULL,
  event_id   UUID         NOT NULL,
  created_at TIMESTAMPTZ  NOT NULL DEFAULT now(),
  PRIMARY KEY (consumer, event_id)
);
