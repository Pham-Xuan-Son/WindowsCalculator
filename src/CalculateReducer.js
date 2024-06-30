import { mathDecimal, Fraction } from "./Math";

const EditTarget = {
  None: 0,
  First: 1,
  Second: 2,
};

const EditStatus = {
  NotEditting: 0,
  EditFormula: 1,
  EditNumber: 2,
};

const formulaBtnMapping = {
  "+/-": "negate",
  x2: "sqr",
  "2√x": "√",
  "1/x": "1/",
};

const formulaFuncMapping = {
  negate: "negate",
  sqr: "sqr",
  "√": "sqrt",
  "1/": "recip",
};

const operators = ["+", "-", "*", "/"];

const PrecisionLength = 17;

export const initialState = {
  firstvalue: null,
  secondvalue: null,
  operator: null,
  result: 0,
  editTarget: EditTarget.First,
  editStatus: EditStatus.EditNumber,
  rememberResult: null,
  error: null,
  display: "",
};

class Calculator {
  number(state, action) {
    let number = action.type;

    if (state.editStatus === EditStatus.EditNumber) {
      if (resultLengthValidator(state)) {
        number = state.result;
      } else if (String(state.result) !== "0") {
        number = state.result + action.type;
      }
    }

    const displayFirstValue = toNumber(state.firstvalue);
    return {
      ...state,
      editStatus: EditStatus.EditNumber,
      result: number,
      display:
        state.editTarget === EditTarget.Second
          ? `${displayFirstValue} ${state.operator}`
          : state.operator
          ? ""
          : state.display,
    };
  }
  operator(state, action) {
    const validationResult = new Fraction(state.result);

    const shouldCalculate =
      state.operator &&
      state.editStatus &&
      state.editTarget === EditTarget.Second;

    const calculateResult = shouldCalculate
      ? calculate(state.firstvalue, state.operator, validationResult)
      : validationResult;

    const firstvalue =
      state.editStatus === EditStatus.EditFormula &&
      state.editTarget === EditTarget.First
        ? state.firstvalue
        : state.editTarget === EditTarget.Second &&
          state.editStatus === EditStatus.NotEditting
        ? state.firstvalue
        : calculateResult;

    const displayFirstValue = toNumber(firstvalue);
    return {
      ...state,
      operator: action.type,
      editTarget: EditTarget.Second,
      editStatus: EditStatus.NotEditting,
      firstvalue: firstvalue,
      result: calculateResult,
      display: `${displayFirstValue} ${action.type}`,
    };
  }
  dot(state, action) {
    let result = "0" + action.type;

    if (state.editStatus === EditStatus.EditNumber) {
      if (String(state.result).includes(".")) {
        result = state.result;
      } else if (String(state.result) !== "0") {
        result = state.result + action.type;
      }
    }

    const displayFirstValue = toNumber(state.firstvalue);
    return {
      ...state,
      editStatus: EditStatus.EditNumber,
      result: result,
      display:
        state.editTarget === EditTarget.Second
          ? `${displayFirstValue} ${state.operator}`
          : state.operator
          ? ""
          : state.display,
    };
  }
  del(state) {
    let result = state.result;
    if (state.editStatus === EditStatus.EditNumber) {
      const minLength = String(result).startsWith("-") ? 2 : 1;
      if (result.length > minLength) {
        result = result.slice(0, -1);
        if (String(result) === "-0") {
          result = "0";
        }
      } else {
        result = "0";
      }
    }

    return {
      ...state,
      result: result,
      display:
        state.editTarget === EditTarget.Second || !state.operator
          ? state.display
          : "",
    };
  }
  ce(state) {
    const displayFirstValue = toNumber(state.firstvalue);
    return {
      ...state,
      editStatus: EditStatus.EditNumber,
      result: "0",
      display:
        state.editTarget === EditTarget.Second
          ? `${displayFirstValue} ${state.operator}`
          : state.operator
          ? ""
          : state.display,
    };
  }
  fomulaOperator(state, action) {
    const result = new Fraction(state.result);
    let firstvalue = state.firstvalue;
    let secondvalue = state.secondvalue;

    const formula = formulaBtnMapping[action.type];

    const displayFirstValue = toNumber(state.firstvalue);
    const displaySecondValue = toNumber(state.secondvalue);

    if (state.editStatus === EditStatus.EditFormula) {
      if (state.editTarget === EditTarget.Second) {
        secondvalue = `${formula}(${displaySecondValue})`;
      } else {
        firstvalue = `${formula}(${displayFirstValue})`;
      }
    } else {
      if (state.editTarget === EditTarget.Second) {
        secondvalue = `${formula}(${result})`;
      } else {
        firstvalue = `${formula}(${result})`;
      }
    }

    if (formula === "negate") {
      state.display =
        state.editStatus !== EditStatus.EditNumber
          ? state.editTarget === EditTarget.Second
            ? `${displayFirstValue} ${state.operator} ${secondvalue}`
            : `${firstvalue}`
          : state.display;
    } else {
      state.display =
        state.editTarget === EditTarget.Second
          ? `${firstvalue} ${state.operator} ${secondvalue}`
          : `${firstvalue}`;
    }

    let finalResult;
    if (state.editStatus === EditStatus.EditNumber && formula === "negate") {
      finalResult =
        state.result.toString() === "0"
          ? state.result
          : String(state.result).startsWith("-")
          ? String(state.result).slice(1)
          : "-" + state.result;
    } else {
      finalResult =
        state.editTarget === EditTarget.Second
          ? calculate(secondvalue)
          : calculate(firstvalue);
    }

    return {
      ...state,
      editStatus:
        formula === "negate"
          ? state.editStatus
            ? state.editStatus
            : EditStatus.EditFormula
          : EditStatus.EditFormula,
      firstvalue: firstvalue,
      secondvalue: secondvalue,
      result: finalResult,
    };
  }

  percentage(state) {
    const result = new Fraction(state.result);
    let firstvalue = state.firstvalue;
    let secondvalue = state.secondvalue;

    const isPlusOrMinus =
      state.operator === operators[0] || state.operator === operators[1];

    if (state.operator) {
      if (isPlusOrMinus) {
        if (state.editTarget === EditTarget.Second) {
          secondvalue = result
            .divide(new Fraction(100))
            .multiply(calculate(firstvalue));
        } else {
          firstvalue = result
            .divide(new Fraction(100))
            .multiply(state.rememberResult);
        }
      } else {
        if (state.editTarget === EditTarget.Second) {
          secondvalue = result.multiply(new Fraction(0.01));
        } else {
          firstvalue = result.multiply(new Fraction(0.01));
        }
      }
    } else {
      firstvalue = new Fraction(0);
    }

    let display;
    if (state.editTarget === EditTarget.Second) {
      display = `${firstvalue} ${state.operator} ${secondvalue}`;
    } else {
      display = `${firstvalue}`;
    }

    return {
      ...state,
      firstvalue: firstvalue,
      secondvalue: secondvalue,
      editStatus: EditStatus.EditFormula,
      result: state.editTarget === EditTarget.Second ? secondvalue : firstvalue,
      display: display,
    };
  }
  equal(state, action) {
    const result = new Fraction(state.result);

    let calculateResult = result;
    let fomula = toNumber(result);

    const displayFirstValue = toNumber(state.firstvalue);
    if (state.operator !== null) {
      const displaySecondValue = toNumber(state.secondvalue);
      if (state.editStatus === EditStatus.EditFormula) {
        calculateResult = calculate(
          state.firstvalue,
          state.operator,
          state.secondvalue
        );
        fomula = `${displayFirstValue} ${state.operator} ${displaySecondValue}`;
      } else if (state.editTarget === EditTarget.Second) {
        calculateResult = calculate(state.firstvalue, state.operator, result);
        fomula = `${displayFirstValue} ${state.operator} ${result}`;
      } else {
        calculateResult = calculate(result, state.operator, state.secondvalue);
        fomula = `${result} ${state.operator} ${displaySecondValue}`;
      }
    } else if (state.editStatus === EditStatus.EditFormula) {
      calculateResult = calculate(state.firstvalue);
      fomula = `${displayFirstValue}`;
    }

    return {
      ...state,
      editTarget: EditTarget.First,
      firstvalue: result,
      secondvalue:
        state.editTarget === EditTarget.Second ? result : state.secondvalue,
      editStatus: EditStatus.NotEditting,
      result: calculateResult,
      rememberResult: calculateResult,
      display: `${fomula} ${action.type}`,
    };
  }
}

let calculator = new Calculator();

export default function calculateReducer(state, action) {
  try {
    state = { ...state };

    if (state.error) {
      if (!isNaN(action.type)) {
        state = {
          ...state,
          error: null,
          result: "0",
          display: "",
        };
      } else {
        return { ...initialState };
      }
    }

    // number
    if (!isNaN(action.type)) {
      return calculator.number(state, action);
    }
    // operator
    if (operators.includes(action.type)) {
      return calculator.operator(state, action);
    }

    if (formulaBtnMapping[action.type]) {
      return calculator.fomulaOperator(state, action);
    }

    switch (action.type) {
      case ".":
        return calculator.dot(state, action);
      case "Del":
        return calculator.del(state);
      case "CE":
        return calculator.ce(state);
      case "C":
        return initialState;
      case "%":
        return calculator.percentage(state);
      case "=":
        return calculator.equal(state, action);
      default:
        return state;
    }
  } catch (e) {
    let display = state.display;
    if (operators.includes(action.type)) {
      if (state.editStatus === EditStatus.EditFormula) {
        display = `${state.firstvalue} ${state.operator} ${state.secondvalue} ${action.type}`;
      } else {
        display = `${state.firstvalue} ${state.operator} ${state.result} ${action.type}`;
      }
    }
    return {
      ...initialState,
      result: e,
      error: e,
      display,
    };
  }
}
// let frac = mathFraction.fraction(500).div(7);
// let num = mathFraction.isNaN(frac);
// let na = mathFraction.format(frac, { notation: "fixed" });
// let ro = mathDecimal.round(frac, 2);
// let dc = mathDecimal.bignumber(frac);
// // let nu = mathFraction.
// let sq = eval("sqrt(5)");
// console.log("num1", ro);
// console.log("num", dc);
// const fraction = new Fraction("9999999999999999");
const fraction3 = new Fraction("7");
const re = new Fraction("5");
const fraction2 = mathDecimal.bignumber(re.toString());
// const fraction1 = new mathFraction.fraction("5");
const result = re.divide(fraction3);
console.log("fraction", fraction2.toString());
// console.log("fraction", fraction1);
console.log("result", result.toString());

function formulaConvert(formula) {
  formula = Object.keys(formulaFuncMapping).reduce((acc, key) => {
    return acc.replace(new RegExp(key, "g"), formulaFuncMapping[key]);
  }, String(formula));
  let number = eval(formula);
  // let number = mathFraction.evaluate(formula);
  return new Fraction(number);
}

function calculate(first, op, second) {
  if (isNaN(first)) {
    first = formulaConvert(first);
  }
  if (second !== undefined) {
    if (isNaN(second)) {
      second = formulaConvert(second);
    }
  }
  let result = first;

  switch (op) {
    case "+":
      result = first.add(second);
      break;
    case "-":
      result = first.subtract(second);
      break;
    case "*":
      result = first.multiply(second);
      break;
    case "/":
      result = divide(first, second);
      break;
    default:
      break;
  }

  return result;
}

function isNaNResult(result) {
  if (!isNaN(result)) {
    if (String(result).length > getMaxLength(result) + 1) {
      result = result.toExponential(15);
    }
  }
  return result;
}

function divide(a, b) {
  if (new Fraction(b).isZero()) {
    if (new Fraction(a).isZero()) {
      throw "Result is undefined";
    }
    throw "Cannot divide by zero";
  }
  return new Fraction(1, 1).multiply(a).divide(b);
}

function negate(value) {
  const newValue = new Fraction(value);
  return new Fraction(-1, 1).multiply(newValue);
}

function sqr(value) {
  const newValue = new Fraction(value);
  return new Fraction(1, 1).multiply(newValue).multiply(newValue);
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

function getMaxLength(result) {
  return String(result).replace("-", "").replace(".", "").trim().startsWith("0")
    ? PrecisionLength
    : PrecisionLength - 1;
}

function resultLengthValidator(state) {
  const lengthOfResult = String(state.result).match(/\d/g).length;
  return lengthOfResult >= getMaxLength(state.result);
}

function numberLengthLimiter(number, precision) {
  const splirtedNumber = String(number).split(".");
  const integerPart = splirtedNumber[0];
  const fractionalPart = splirtedNumber[1] || "";

  const numberLimitedLength = fractionalPart.slice(
    integerPart.length - 1,
    precision - 1
  );
  let result = `${integerPart}`;
  if (String(numberLimitedLength).length > 0) {
    result += `.${numberLimitedLength}`;
  }
  return result;
}

function toNumber(value) {
  if (isNaN(value)) {
    return value;
  }
  const num = String(value).match(/\d/g);
  if (num) {
    if (num.length > getMaxLength(value))
      return numberLengthLimiter(value, getMaxLength(value));
  }
  return String(value);
}

export function numberLengthValidator(value) {
  if (isNaN(value)) {
    return value;
  }
  if (String(value).endsWith(".")) {
    return value;
  }
  // return value;
  // return roundTo(value);
  // return mathFraction.format(value, { notation: "fixed", precision: 4 });
  return toNumber(value);
}

export function numberFormatter(value) {
  let formattedValue = String(value).replace("-", "").split(".")[0].trim();

  if (formattedValue.match(/\d/g) && formattedValue.length > 3) {
    for (let i = formattedValue.length - 3; i > 0; i -= 3) {
      formattedValue =
        formattedValue.slice(0, i) + "," + formattedValue.slice(i);
    }
  } else {
    return value;
  }
  if (String(value).startsWith("-")) {
    formattedValue = "-" + formattedValue;
  }

  return String(value).split(".")[1] === undefined
    ? String(formattedValue)
    : String(formattedValue + "." + String(value).split(".")[1]);
}

export function displayFormatter(value) {
  if (String(value) === "") {
    return value;
  }
  const displayValue = String(value).split(" ");
  const isFormula = (string) => !isNaN(string);
  const firstvalue = isFormula(displayValue[0])
    ? numberLengthValidator(displayValue[0])
    : value;
  const operator = isFormula(displayValue[0])
    ? `${numberLengthValidator(displayValue[0])} ${displayValue[1]}`
    : value;
  const secondvalue = `${
    isFormula(displayValue[0])
      ? numberLengthValidator(displayValue[0])
      : displayValue[0]
  } ${displayValue[1]} ${
    isFormula(displayValue[2])
      ? numberLengthValidator(displayValue[2])
      : displayValue[2]
  }`;
  const otherValue = displayValue[3] !== undefined ? displayValue[3] : "";

  if (displayValue[1] === undefined) {
    return firstvalue;
  } else if (displayValue[2] === undefined) {
    return operator;
  } else if (displayValue[3] === undefined) {
    return secondvalue;
  }
  return `${secondvalue} ${otherValue}`;
}
