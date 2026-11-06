import { Inject, Injectable } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { CLOCK, ClockModule, FixedClock, SystemClock, type Clock } from '.';

describe('SystemClock', () => {
  it('returns the current time', () => {
    const before = Date.now();
    const now = new SystemClock().now().getTime();
    expect(now).toBeGreaterThanOrEqual(before);
    expect(now).toBeLessThanOrEqual(Date.now());
  });
});

describe('FixedClock', () => {
  it('returns the fixed instant until it is moved', () => {
    const clock = new FixedClock(new Date('2026-03-31T23:59:59Z'));
    expect(clock.now().toISOString()).toBe('2026-03-31T23:59:59.000Z');
    clock.advance(1000);
    expect(clock.now().toISOString()).toBe('2026-04-01T00:00:00.000Z');
    clock.set(new Date('2026-01-01T00:00:00Z'));
    expect(clock.now().toISOString()).toBe('2026-01-01T00:00:00.000Z');
  });

  it('hands out copies, so callers cannot mutate it', () => {
    const clock = new FixedClock(new Date('2026-01-01T00:00:00Z'));
    clock.now().setFullYear(1999);
    expect(clock.now().getUTCFullYear()).toBe(2026);
  });
});

describe('CLOCK injection token', () => {
  @Injectable()
  class NeedsTime {
    constructor(@Inject(CLOCK) readonly clock: Clock) {}
  }

  it('injects SystemClock by default and can be overridden with a FixedClock in tests', async () => {
    const real = await Test.createTestingModule({ imports: [ClockModule], providers: [NeedsTime] }).compile();
    expect(real.get(NeedsTime).clock).toBeInstanceOf(SystemClock);

    const fixed = new FixedClock(new Date('2026-05-01T00:00:00Z'));
    const faked = await Test.createTestingModule({ imports: [ClockModule], providers: [NeedsTime] })
      .overrideProvider(CLOCK)
      .useValue(fixed)
      .compile();
    expect(faked.get(NeedsTime).clock.now().toISOString()).toBe('2026-05-01T00:00:00.000Z');
  });
});
