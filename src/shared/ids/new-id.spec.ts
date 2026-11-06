import { newId } from './new-id';

const UUID_V7 = /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

describe('newId', () => {
  it('returns a valid UUIDv7 (version 7, RFC 9562 variant)', () => {
    for (let i = 0; i < 100; i++) expect(newId()).toMatch(UUID_V7);
  });

  it('encodes the creation time in the first 48 bits', () => {
    const before = Date.now();
    const id = newId();
    const after = Date.now();
    const ms = parseInt(id.replace(/-/g, '').slice(0, 12), 16);
    expect(ms).toBeGreaterThanOrEqual(before);
    expect(ms).toBeLessThanOrEqual(after + 1);
  });

  it('is strictly time-ordered, even within the same millisecond', () => {
    const ids = Array.from({ length: 10_000 }, () => newId());
    expect([...ids].sort()).toEqual(ids);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
