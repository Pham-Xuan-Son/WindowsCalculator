import BigNumber from "bignumber.js";
import Fraction from "fraction.js";
import { string } from "mathjs";

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

const firstvalueObj = {
  numerator: 0,
  denominator: 1,
};

const secondvalueObj = {
  numerator: 0,
  denominator: 1,
};

const resultObj = {
  numerator: 0,
  denominator: 1,
};

const operators = ["+", "-", "*", "/"];

const PrecisionLength = 16;

export const initialState = {
  firstvalue: firstvalueObj,
  secondvalue: secondvalueObj,
  operator: null,
  result: "0",
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

    return {
      ...state,
      editStatus: EditStatus.EditNumber,
      result: number,
      display:
        state.editTarget === EditTarget.Second
          ? `${valueToNumber(state.firstvalue)} ${state.operator}`
          : state.operator
          ? ""
          : state.display,
    };
  }
  operator(state, action) {
    const validationResult = new BigNumber(state.result);

    const shouldCalculate =
      state.operator &&
      state.editStatus &&
      state.editTarget === EditTarget.Second;

    const calculateResult = shouldCalculate
      ? calculate(
          `${valueToNumber(state.firstvalue)} ${
            state.operator
          } ${validationResult}`
        )
      : validationResult;

    const firstvalue =
      state.editStatus === EditStatus.EditFormula &&
      state.editTarget === EditTarget.First
        ? valueToNumber(state.firstvalue)
        : state.editTarget === EditTarget.Second &&
          state.editStatus === EditStatus.NotEditting
        ? valueToNumber(state.firstvalue)
        : calculateResult;
    return {
      ...state,
      operator: action.type,
      editTarget: EditTarget.Second,
      editStatus: EditStatus.NotEditting,
      firstvalue: valueObj(firstvalue),
      result: calculateResult,
      display: `${firstvalue} ${action.type}`,
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

    return {
      ...state,
      editStatus: EditStatus.EditNumber,
      result: result,
      display:
        state.editTarget === EditTarget.Second
          ? `${valueToNumber(state.firstvalue)} ${state.operator}`
          : state.operator
          ? ""
          : state.display,
    };
  }
  del(state) {
    let result = new BigNumber(state.result);
    if (state.editStatus === EditStatus.EditNumber) {
      const minLength = String(result).startsWith("-") ? 2 : 1;
      if (result.toString().length > minLength) {
        result = result.toString().slice(0, -1);
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
    return {
      ...state,
      editStatus: EditStatus.EditNumber,
      result: "0",
      display:
        state.editTarget === EditTarget.Second
          ? `${valueToNumber(state.firstvalue)} ${state.operator}`
          : state.operator
          ? ""
          : state.display,
    };
  }
  fomulaOperator(state, action) {
    const result = new BigNumber(state.result);
    let firstvalue = state.firstvalue;
    let secondvalue = state.secondvalue;

    const formula = formulaBtnMapping[action.type];

    if (state.editStatus === EditStatus.EditFormula) {
      if (state.editTarget === EditTarget.Second) {
        secondvalue = `${formula}(${state.secondvalue})`;
      } else {
        firstvalue = `${formula}(${state.firstvalue})`;
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
            ? `${state.firstvalue} ${state.operator} ${secondvalue}`
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
        String(state.result) === "0"
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
      firstvalue: valueObj(firstvalue),
      secondvalue: valueObj(secondvalue),
      result: finalResult,
    };
  }

  percentage(state) {
    const result = new BigNumber(state.result);
    let firstvalue = new Fraction(
      state.firstvalue.numerator,
      state.firstvalue.denominator
    );
    let secondvalue = new Fraction(
      state.secondvalue.numerator,
      state.secondvalue.denominator
    );

    const isPlusOrMinus =
      state.operator === operators[0] || state.operator === operators[1];

    if (state.operator) {
      if (isPlusOrMinus) {
        if (state.editTarget === EditTarget.Second) {
          secondvalue = result.div(100).mul(firstvalue);
        } else {
          firstvalue = result.div(100).mul(state.rememberResult);
        }
      } else {
        if (state.editTarget === EditTarget.Second) {
          secondvalue = result.mul(0.01);
        } else {
          firstvalue = result.mul(0.01);
        }
      }
    } else {
      firstvalue = firstvalueObj;
    }

    let display;
    if (state.editTarget === EditTarget.Second) {
      display = `${valueToNumber(firstvalue)} ${state.operator} ${valueToNumber(
        secondvalue
      )}`;
    } else {
      display = `${valueToNumber(firstvalue)}`;
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
    const result = new BigNumber(state.result);

    let fomula = result;
    if (state.operator !== null) {
      if (state.editStatus === EditStatus.EditFormula) {
        fomula = `${valueToNumber(state.firstvalue)} ${
          state.operator
        } ${valueToNumber(state.secondvalue)}`;
      } else if (state.editTarget === EditTarget.Second) {
        fomula = `${valueToNumber(state.firstvalue)} ${
          state.operator
        } ${result}`;
      } else {
        fomula = `${result} ${state.operator} ${valueToNumber(
          state.secondvalue
        )}`;
      }
    } else if (state.editStatus === EditStatus.EditFormula) {
      fomula = `${valueToNumber(state.firstvalue)}`;
    }

    const calculateResult = calculate(fomula);

    return {
      ...state,
      editTarget: EditTarget.First,
      firstvalue: valueObj(result),
      secondvalue:
        state.editTarget === EditTarget.Second
          ? valueObj(result)
          : state.secondvalue,
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
    let firstvalue = valueToNumber(state.firstvalue);
    let secondvalue = valueToNumber(state.secondvalue);
    if (operators.includes(action.type)) {
      if (state.editStatus === EditStatus.EditFormula) {
        display = `${firstvalue} ${state.operator} ${secondvalue} ${action.type}`;
      } else {
        display = `${firstvalue} ${state.operator} ${state.result} ${action.type}`;
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

function calculate(formula) {
  formula = Object.keys(formulaFuncMapping).reduce((acc, key) => {
    return acc.replace(new RegExp(key, "g"), formulaFuncMapping[key]);
  }, String(formula));

  const splitFormula = formula.split(" ");
  const firstvalueObj = valueObj(splitFormula[0]);
  const { numerator, denominator } = firstvalueObj;
  const first = new Fraction(numerator, denominator);
  const operator = splitFormula[1];
  const secondvalueObj = valueObj(splitFormula[2]);
  let second;
  if (secondvalueObj) {
    const { numerator, denominator } = secondvalueObj;
    second = new Fraction(numerator, denominator);
  }
  let result = first;
  if (operator) {
    if (string(operator) === "+") {
      result = first.add(second);
    } else if (string(operator) === "-") {
      result = first.sub(second);
    } else if (string(operator) === "*") {
      result = first.mul(second);
    } else if (string(operator) === "/") {
      result = first.div(second);
    }
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
  const bigA = new BigNumber(a);
  const bigB = new BigNumber(b);
  if (bigB.isEqualTo(0)) {
    if (bigA.isEqualTo(0)) {
      throw "Result is undefined";
    }
    throw "Cannot divide by zero";
  }
  return bigA.dividedBy(bigB);
}

function negate(value) {
  const negate = new BigNumber(value);
  return negate.multipliedBy(-1);
}

function sqr(value) {
  const bigValue = new BigNumber(value);
  return bigValue.multipliedBy(bigValue);
}

function sqrt(value) {
  const bigValue = new BigNumber(value);
  if (bigValue.isLessThan(0)) {
    throw "Invalid input";
  }
  return bigValue.sqrt();
}

function recip(value) {
  const bigValue = new BigNumber(value);
  return divide(1, bigValue.toString());
}

function getMaxLength(result) {
  return String(result).replace("-", "").trim().startsWith("0")
    ? PrecisionLength + 1
    : PrecisionLength;
}

function resultLengthValidator(state) {
  const lengthOfResult = String(state.result).match(/\d/g).length;
  return lengthOfResult >= getMaxLength(state.result);
}

function roundTo(num) {
  const number = new BigNumber(num);
  return number.precision(PrecisionLength);
}

export function numberLengthValidator(value) {
  if (isNaN(value)) {
    return value;
  }
  if (String(value).endsWith(".")) {
    return value;
  }
  return roundTo(value);
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

function decimalLengthValidator(value) {
  if (isNaN(value)) {
    return value;
  }
  const bigValue = new BigNumber(value);
  if (String(bigValue).includes(".")) {
    return String(bigValue).split(".")[1].length + 1;
  }
  return 1;
}

function valueObj(value) {
  if (!value) {
    return;
  }
  // if (isNaN(value)) {
  //   return;
  // }
  const bigValue = new BigNumber(value);
  const decimalLength = decimalLengthValidator(bigValue);
  const number = String(bigValue).match(/\d/g).join("");

  const denominator = String(1).padEnd(decimalLength, "0");

  return { numerator: number, denominator: denominator };
}

function valueToNumber(value) {
  const { numerator, denominator } = value;
  const num = new BigNumber(numerator);
  const denom = new BigNumber(denominator);
  return num.dividedBy(denom);
}
