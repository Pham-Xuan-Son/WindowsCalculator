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

export const initialState = {
  firstvalue: null,
  secondvalue: null,
  operator: null,
  result: "0",
  editTarget: EditTarget.First,
  editStatus: EditStatus.EditNumber,
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

    if (state.editStatus === EditStatus.EditFormula) {
      if (state.editTarget === EditTarget.Second) {
        secondvalue = `${action}(${state.secondvalue})`;
      } else {
        firstvalue = `${action}(${state.firstvalue})`;
      }
    } else {
      if (state.editTarget === EditTarget.Second) {
        secondvalue = `${action}(${result})`;
      } else {
        firstvalue = `${action}(${result})`;
      }
    }

    if (action === "negate") {
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
    if (state.editStatus === EditStatus.EditNumber && action === "negate") {
      finalResult =
        String(state.result) === "0"
          ? state.result
          : state.result.startsWith("-")
          ? state.result.slice(1)
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
        action === "negate"
          ? state.editStatus
            ? state.editStatus
            : EditStatus.EditFormula
          : EditStatus.EditFormula,
      firstvalue: firstvalue,
      secondvalue: secondvalue,
      // editStatus: EditStatus.EditFormula,
      result: finalResult,
    };
  }

  pecent(state) {
    const result =
      state.editTarget === EditTarget.Second
        ? state.operator === operators[0] || state.operator === operators[1]
          ? (Number(state.result) / 100) * Number(state.firstvalue)
          : Number(state.result) * 0.01
        // : String(operators).includes(state.operator) && !state.editStatus
        // ? state.operator === operators[0] || state.operator === operators[1]
        //   ? Number(state.result) * 0.1
        //   : Number(state.result) * 0.01
        : 0;
    let display = `0`;
    if (state.editTarget === EditTarget.Second) {
      display = `${state.firstvalue} ${state.operator} ${result}`;
    } else if (
      String(operators).includes(state.operator) &&
      !state.editStatus
    ) {
      display = `${result}`;
    }

    return {
      ...state,
      result: result,
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
      return calculator.fomulaOperator(state, formulaBtnMapping[action.type]);
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
        return calculator.pecent(state);
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
  formula = String(formula).includes("√")
    ? String(formula).replace(/√/g, formulaFuncMapping["√"])
    : formula;

  formula = String(formula).includes("1/")
    ? String(formula).replace(/1\//g, formulaFuncMapping["1/"])
    : formula;

  let values = String(formula).split("/");

  formula =
    values.length === 2 ? `divide(${values[0]}, ${values[1]})` : formula;
  return parseFloat(Number(eval(String(formula)))); //.toExponential();
}

function divide(a, b) {
  if (Number(b) === 0) {
    if (Number(a) === 0) {
      throw "Result is undefined";
    }
    throw "Cannot divide by zero";
  }
  return a / b;
}

function negate(value) {
  return -value;
}

function sqr(value) {
  return value * value;
}

function sqrt(value) {
  if (value < 0) {
    throw "Invalid input";
  }
  return Math.sqrt(value);
}

function recip(value) {
  return divide(1, value);
}

function resultLengthValidator(state) {
  const lengthOfResult = String(state.result).match(/\d/g).length;
  return String(state.result).replace("-", "").trim().startsWith("0")
    ? lengthOfResult > 16
    : lengthOfResult > 15;
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
