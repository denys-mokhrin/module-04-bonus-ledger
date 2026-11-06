import { Global, Injectable, Module } from '@nestjs/common';

/** Code reads the time only through an injected Clock, never Date.now() (testable time). */
export interface Clock {
  now(): Date;
}

export const CLOCK = Symbol('CLOCK');

@Injectable()
export class SystemClock implements Clock {
  now(): Date {
    return new Date();
  }
}

/** Test double: a clock that stands still until moved. */
export class FixedClock implements Clock {
  private current: number;

  constructor(start: Date) {
    this.current = start.getTime();
  }

  now(): Date {
    return new Date(this.current);
  }

  set(instant: Date): void {
    this.current = instant.getTime();
  }

  advance(ms: number): void {
    this.current += ms;
  }
}

@Global()
@Module({
  providers: [{ provide: CLOCK, useClass: SystemClock }],
  exports: [CLOCK],
})
export class ClockModule {}
