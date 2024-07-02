import { create, all } from "mathjs";

export const mathDecimal = create(all, {
  number: "BigNumber",
  precision: 64,
  relTol: 1e-60,
  absTol: 1e-63,
});

export class Fraction {
  constructor(value, denominator) {
    if (value instanceof Fraction) {
      this.numerator = value.numerator;
      this.denominator = value.denominator;
      return;
    }
    if (denominator) {
      this.numerator = mathDecimal.bignumber(value);
      this.denominator = mathDecimal.bignumber(denominator);
      return;
    }
    const [numer, denom] = mathDecimal.bignumber(value).toFraction();
    this.numerator = mathDecimal.bignumber(numer);
    this.denominator = mathDecimal.bignumber(denom);
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
    const num = this.numerator.div(this.denominator);
    const num2 = num.toSignificantDigits(16);

    const number = String(num2.toFixed()).match(/\d/g);
    const start0s = String(num2).replace(/\D/g, "").match(/^0*/)[0].length;

    if (num2.precision(true) > 16 || number.length >= 18) {
      return start0s
        ? num2.toPrecision(16 + 1 - start0s)
        : num2.toExponential();
    }

    return num2.toSignificantDigits(16 + 1 - start0s).toFixed();
  }
}

export function divide(a, b) {
  if (new Fraction(b).isZero()) {
    if (new Fraction(a).isZero()) {
      throw "Result is undefined";
    }
    throw "Cannot divide by zero";
  }
  return a.divide(b);
}

const formulaFuncMapping = {
  negate: "negate",
  sqr: "sqr",
  "√": "sqrt",
  "1/": "recip",
};

export class NumberFormula {
  constructor(value, formula) {
    this.value = value;
    this.formula = formula;
  }

  evaluate() {
    let value = this.value;
    if (this.value instanceof NumberFormula) {
      value = this.value.evaluate();
    }
    return eval(`${formulaFuncMapping[this.formula]}(value)`);
  }

  toString() {
    return `${this.formula}(${this.value})`;
  }
}

function negate(value) {
  const newValue = new Fraction(value);
  return new Fraction(-1, 1).multiply(newValue);
}

function sqr(value) {
  const newValue = new Fraction(value);
  return newValue.multiply(newValue);
}

function sqrt(value) {
  const newValue = new Fraction(value);
  if (new Fraction(value).isNegative()) {
    throw "Invalid input";
  }
  return newValue.sqrt();
}

function recip(value) {
  const newValue = new Fraction(value);
  const num = new Fraction(1, 1);
  return divide(num, newValue);
}
