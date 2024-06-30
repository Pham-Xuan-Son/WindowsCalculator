import { create, all } from "mathjs";

export const mathDecimal = create(all, {
  number: "BigNumber",
  precision: 64,
  relTol: 1e-60,
  absTol: 1e-63,
});

export class Fraction {
  constructor(numerator, denominator = 1) {
    const number = String(numerator);
    if (number.includes(".")) {
      const [num, frac] = number.split(".");
      const scale = Math.pow(10, frac.length);
      this.numerator = mathDecimal.bignumber(num + frac);
      this.denominator = mathDecimal.bignumber(scale);
    } else {
      this.numerator = mathDecimal.bignumber(number);
      this.denominator = mathDecimal.bignumber(denominator);
    }
  }

  add(fraction) {
    return new Fraction(
      this.numerator
        .times(fraction.denominator)
        .plus(fraction.numerator.times(this.denominator)),
      this.denominator.times(fraction.denominator)
    );
  }

  subtract(fraction) {
    return new Fraction(
      this.numerator
        .times(fraction.denominator)
        .minus(fraction.numerator.times(this.denominator)),
      this.denominator.times(fraction.denominator)
    );
  }

  multiply(fraction) {
    return new Fraction(
      this.numerator.times(fraction.numerator),
      this.denominator.times(fraction.denominator)
    );
  }

  divide(fraction) {
    return new Fraction(
      this.numerator.times(fraction.denominator),
      this.denominator.times(fraction.numerator)
    );
  }

  isZero() {
    return this.numerator.isZero();
  }

  isNegative() {
    return this.numerator.isNegative();
  }

  sqrt() {
    return new Fraction(this.numerator.sqrt(), this.denominator.sqrt());
  }

  toString() {
    return this.numerator.div(this.denominator).toString();
  }
}
