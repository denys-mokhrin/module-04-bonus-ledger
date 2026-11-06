import { CurrencyMismatchError, InvalidMoneyError, Money } from './money';

describe('Money', () => {
  it('holds integer minor units and an ISO 4217 currency', () => {
    const m = Money.of(12_345, 'EUR');
    expect(m.amountCents).toBe(12_345);
    expect(m.currency).toBe('EUR');
    expect(m.toJSON()).toEqual({ amountCents: 12_345, currency: 'EUR' });
  });

  it.each([1.5, 0.1, Number.NaN, Number.POSITIVE_INFINITY, Number.MAX_SAFE_INTEGER + 1])(
    'rejects non-integer or unsafe amount %p',
    (amount) => {
      expect(() => Money.of(amount, 'EUR')).toThrow(InvalidMoneyError);
    },
  );

  it.each(['eur', 'EURO', 'E1R', ''])('rejects malformed currency %p', (currency) => {
    expect(() => Money.of(100, currency)).toThrow(InvalidMoneyError);
  });

  it('adds and subtracts within one currency', () => {
    expect(Money.of(1000, 'USD').add(Money.of(250, 'USD'))).toEqual(Money.of(1250, 'USD'));
    expect(Money.of(1000, 'USD').subtract(Money.of(1250, 'USD'))).toEqual(Money.of(-250, 'USD'));
  });

  it('rejects arithmetic across currencies', () => {
    expect(() => Money.of(100, 'USD').add(Money.of(100, 'EUR'))).toThrow(CurrencyMismatchError);
    expect(() => Money.of(100, 'USD').subtract(Money.of(100, 'EUR'))).toThrow(CurrencyMismatchError);
  });

  it('compares by value', () => {
    expect(Money.of(100, 'USD').equals(Money.of(100, 'USD'))).toBe(true);
    expect(Money.of(100, 'USD').equals(Money.of(100, 'EUR'))).toBe(false);
  });
});
