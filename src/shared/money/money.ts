import { DomainError } from '../errors';

export class InvalidMoneyError extends DomainError {
  readonly code = 'MONEY_INVALID';
  readonly httpStatus = 422;
}

export class CurrencyMismatchError extends DomainError {
  readonly code = 'MONEY_CURRENCY_MISMATCH';
  readonly httpStatus = 422;
}

const ISO_CURRENCY = /^[A-Z]{3}$/;

/** Integer minor units (amountCents) plus an ISO 4217 currency code. Never floats (.claude/rules/money.md). */
export class Money {
  private constructor(
    readonly amountCents: number,
    readonly currency: string,
  ) {}

  static of(amountCents: number, currency: string): Money {
    if (!Number.isSafeInteger(amountCents)) {
      throw new InvalidMoneyError('Money amount must be an integer number of minor units (amountCents)');
    }
    if (!ISO_CURRENCY.test(currency)) {
      throw new InvalidMoneyError('Money currency must be an ISO 4217 code such as EUR');
    }
    return new Money(amountCents, currency);
  }

  add(other: Money): Money {
    this.assertSameCurrency(other);
    return Money.of(this.amountCents + other.amountCents, this.currency);
  }

  subtract(other: Money): Money {
    this.assertSameCurrency(other);
    return Money.of(this.amountCents - other.amountCents, this.currency);
  }

  equals(other: Money): boolean {
    return this.amountCents === other.amountCents && this.currency === other.currency;
  }

  toJSON(): { amountCents: number; currency: string } {
    return { amountCents: this.amountCents, currency: this.currency };
  }

  private assertSameCurrency(other: Money): void {
    if (other.currency !== this.currency) {
      throw new CurrencyMismatchError(`Cannot combine ${this.currency} with ${other.currency}`);
    }
  }
}
