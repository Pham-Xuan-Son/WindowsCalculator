import { Fraction, NumberFormula, divide } from "./Math";

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
    const result = new Fraction(state.result);
    let firstvalue = state.firstvalue;
    let secondvalue = state.secondvalue;

    const formula = formulaBtnMapping[action.type];

    if (state.editStatus === EditStatus.EditFormula) {
      if (state.editTarget === EditTarget.Second) {
        secondvalue = new NumberFormula(state.secondvalue, formula);
      } else {
        firstvalue = new NumberFormula(state.firstvalue, formula);
      }
    } else {
      if (state.editTarget === EditTarget.Second) {
        secondvalue = new NumberFormula(result, formula);
      } else {
        firstvalue = new NumberFormula(result, formula);
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
    let formula = result;

    if (state.operator !== null) {
      if (state.editStatus === EditStatus.EditFormula) {
        calculateResult = calculate(
          state.firstvalue,
          state.operator,
          state.secondvalue
        );
        formula = `${state.firstvalue} ${state.operator} ${state.secondvalue}`;
      } else if (state.editTarget === EditTarget.Second) {
        calculateResult = calculate(state.firstvalue, state.operator, result);
        formula = `${state.firstvalue} ${state.operator} ${result}`;
      } else {
        calculateResult = calculate(result, state.operator, state.secondvalue);
        formula = `${result} ${state.operator} ${state.secondvalue}`;
      }
    } else if (state.editStatus === EditStatus.EditFormula) {
      calculateResult = calculate(state.firstvalue);
      formula = `${state.firstvalue}`;
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
      display: `${formula} ${action.type}`,
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

function formulaConvert(formula) {
  if (formula instanceof NumberFormula) {
    let number = formula.evaluate();
    return new Fraction(number);
  }
  return formula;
}

function calculate(first, op, second) {
  first = formulaConvert(first);
  if (second) {
    second = formulaConvert(second);
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

function getMaxLength(result) {
  return String(result).replace("-", "").replace(".", "").trim().startsWith("0")
    ? PrecisionLength
    : PrecisionLength - 1;
}

function resultLengthValidator(state) {
  const lengthOfResult = String(state.result).match(/\d/g).length;
  return lengthOfResult >= getMaxLength(state.result);
}

export function numberFormatter(value) {
  let formattedValue = String(value).replace("-", "").split(".")[0].trim();

  if (formattedValue.match(/\d/g) && formattedValue.length > 3) {
    if (String(value).includes("e")) {
      return String(value).replace("e", ".e");
    }
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
