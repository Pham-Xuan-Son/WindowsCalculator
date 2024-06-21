import BigNumber from "bignumber.js";

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

const PrecisionLength = 16;

export const initialState = {
  firstvalue: null,
  secondvalue: null,
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
          ? `${state.firstvalue} ${state.operator}`
          : state.operator
          ? ""
          : state.display,
    };
  }
  operator(state, action) {
    const validationResult = Number(state.result);

    const shouldCalculate =
      state.operator &&
      state.editStatus &&
      state.editTarget === EditTarget.Second;

    const calculateResult = shouldCalculate
      ? calculate(`${state.firstvalue} ${state.operator} ${validationResult}`)
      : validationResult;

    const firstvalue =
      state.editStatus === EditStatus.EditFormula &&
      state.editTarget === EditTarget.First
        ? state.firstvalue
        : state.editTarget === EditTarget.Second &&
          state.editStatus === EditStatus.NotEditting
        ? state.firstvalue
        : calculateResult;

    return {
      ...state,
      operator: action.type,
      editTarget: EditTarget.Second,
      editStatus: EditStatus.NotEditting,
      firstvalue: firstvalue,
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
          ? `${state.firstvalue} ${state.operator}`
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
    return {
      ...state,
      editStatus: EditStatus.EditNumber,
      result: "0",
      display:
        state.editTarget === EditTarget.Second
          ? `${state.firstvalue} ${state.operator}`
          : state.operator
          ? ""
          : state.display,
    };
  }
  fomulaOperator(state, action) {
    const result = Number(state.result);
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
      firstvalue: firstvalue,
      secondvalue: secondvalue,
      result: finalResult,
    };
  }

  percentage(state) {
    const result = new BigNumber(Number(state.result));
    let firstvalue = state.firstvalue;
    let secondvalue = state.secondvalue;

    const isPlusOrMinus =
      state.operator === operators[0] || state.operator === operators[1];

    if (state.operator) {
      if (isPlusOrMinus) {
        if (state.editTarget === EditTarget.Second) {
          secondvalue = result
            .dividedBy(100)
            .multipliedBy(calculate(firstvalue));
        } else {
          firstvalue = result.dividedBy(100).multipliedBy(state.rememberResult);
        }
      } else {
        if (state.editTarget === EditTarget.Second) {
          secondvalue = result.multipliedBy(0.01);
        } else {
          firstvalue = result.multipliedBy(0.01);
        }
      }
    } else {
      firstvalue = 0;
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
    const result = Number(state.result);

    let fomula = result;
    if (state.operator !== null) {
      if (state.editStatus === EditStatus.EditFormula) {
        fomula = `${state.firstvalue} ${state.operator} ${state.secondvalue}`;
      } else if (state.editTarget === EditTarget.Second) {
        fomula = `${state.firstvalue} ${state.operator} ${result}`;
      } else {
        fomula = `${result} ${state.operator} ${state.secondvalue}`;
      }
    } else if (state.editStatus === EditStatus.EditFormula) {
      fomula = `${state.firstvalue}`;
    }

    const calculateResult = calculate(fomula);

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

function calculate(formula) {
  formula = Object.keys(formulaFuncMapping).reduce((acc, key) => {
    return acc.replace(new RegExp(key, "g"), formulaFuncMapping[key]);
  }, String(formula));

  const splitFormula = formula.split(" ");
  const firstvalue = new BigNumber(eval(splitFormula[0]));
  const operator = splitFormula[1];
  const secondvalue = new BigNumber(eval(splitFormula[2]));

  let result = firstvalue;

  if (splitFormula[1] !== undefined) {
    if (String(operator) === "+") {
      result = firstvalue.plus(secondvalue);
    } else if (String(operator) === "-") {
      result = firstvalue.minus(secondvalue);
    } else if (String(operator) === "*") {
      result = firstvalue.multipliedBy(secondvalue);
    } else if (String(operator) === "/") {
      result = divide(firstvalue, secondvalue);
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
  return String(result).replace("-", "").trim().startsWith("0") ? PrecisionLength + 1 : PrecisionLength;
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
