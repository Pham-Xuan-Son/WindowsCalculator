import { create, all } from "mathjs";

export const mathDecimal = create(all, {
  number: "BigNumber",
  precision: 64,
  relTol: 1e-60,
  absTol: 1e-63,
});

export class Fraction {
    constructor(numerator, denominator) {
        this.numerator = mathDecimal.bignumber(numerator);
        this.denominator = mathDecimal.bignumber(denominator);
    }

    add(fraction) {
        return new Fraction(
            numerator.times(fraction.denominator).plus(fraction.numerator.times(denominator)),
            denominator.times(fraction.denominator)
        );
    }

    subtract(fraction) {
        return new Fraction(
            numerator.times(fraction.denominator).minus(fraction.numerator.times(denominator)),
            denominator.times(fraction.denominator)
        );
    }

    multiply(fraction) {
        return new Fraction(
            numerator.times(fraction.numerator),
            denominator.times(fraction.denominator)
        );
    }

    divide(fraction) {
        return new Fraction(
            numerator.times(fraction.denominator),
            denominator.times(fraction.numerator)
        );
    }

    toString() {
        return this.numerator.div(this.denominator).toString();
    }
}