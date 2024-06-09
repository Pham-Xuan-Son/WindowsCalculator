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
    const validationResult = dotVerification(state.result);

    const shouldCalculate =
      state.operator &&
      state.editStatus &&
      state.editTarget === EditTarget.Second;

    const calculateResult = shouldCalculate
      ? calculateNumbers(
          `${state.firstvalue} ${state.operator} ${validationResult}`,
          state
        )
      : validationResult;

    const firstvalue =
      state.editStatus === EditStatus.EditFormula &&
      state.editTarget === EditTarget.First
        ? state.firstvalue
        : state.editTarget === EditTarget.Second &&
          state.editStatus === EditStatus.NotEditting
        ? state.firstvalue
        : calculateResult;

    let displayFormula = String(firstvalue);
    if (String(firstvalue).includes("sqrt")) {
      displayFormula = String(firstvalue).replace(/sqrt/g, "√");
    }

    if (String(firstvalue).includes("recip")) {
      displayFormula = String(firstvalue).replace(/recip/g, "1/");
    }

    return {
      ...state,
      operator: action.type,
      editTarget: EditTarget.Second,
      editStatus: EditStatus.NotEditting,
      firstvalue: firstvalue,
      result: calculateResult,
      display: `${displayFormula} ${action.type}`,
    };
  }
  negate(state, action) {
    const validationResult = dotVerification(state.result);
    let firstvalue = state.firstvalue;
    let secondvalue = state.secondvalue;

    if (state.editStatus === EditStatus.EditFormula) {
      if (state.editTarget === EditTarget.Second) {
        secondvalue = `negate(${state.secondvalue})`;
      } else {
        firstvalue = `negate(${state.firstvalue})`;
      }
    } else if (state.editStatus === EditStatus.NotEditting) {
      if (state.editTarget === EditTarget.Second) {
        secondvalue = `negate(${validationResult})`;
      } else {
        firstvalue = `negate(${validationResult})`;
      }
    }

    let result;
    if (state.editStatus !== EditStatus.EditNumber) {
      result =
        state.editTarget === EditTarget.Second
          ? eval(secondvalue)
          : eval(firstvalue);
    } else {
      result =
        String(state.result) === "0"
          ? state.result
          : state.result.startsWith("-")
          ? state.result.slice(1)
          : "-" + state.result;
    }

    return {
      ...state,
      editStatus: state.editStatus ? state.editStatus : EditStatus.EditFormula,
      firstvalue: firstvalue,
      secondvalue: secondvalue,
      result: result,
      display:
        state.editStatus !== EditStatus.EditNumber
          ? state.editTarget === EditTarget.Second
            ? `${state.firstvalue} ${state.operator} ${secondvalue}`
            : `${firstvalue}`
          : state.display,
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
  square(state, action) {
    const result = dotVerification(state.result);
    let firstvalue = state.firstvalue;
    let secondvalue = state.secondvalue;

    if (state.editStatus === EditStatus.EditFormula) {
      if (state.editTarget === EditTarget.Second) {
        secondvalue = `sqr(${state.secondvalue})`;
      } else {
        firstvalue = `sqr(${state.firstvalue})`;
      }
    } else if (state.editStatus === EditStatus.EditNumber) {
      if (state.editTarget === EditTarget.Second) {
        secondvalue = `sqr(${result})`;
      } else {
        firstvalue = `sqr(${result})`;
      }
    } else {
      if (state.editTarget === EditTarget.Second) {
        secondvalue = `sqr(${result})`;
      } else {
        firstvalue = `sqr(${result})`;
      }
    }

    let finalResult;
    let calculateResult =
      state.editTarget === EditTarget.Second
        ? eval(secondvalue)
        : eval(firstvalue);
    if (state.editStatus !== EditStatus.EditNumber) {
      finalResult = calculateResult;
    } else {
      finalResult = calculateResult;
    }

    return {
      ...state,
      firstvalue: firstvalue,
      secondvalue: secondvalue,
      editStatus: EditStatus.EditFormula,
      result: finalResult,
      display:
        state.editTarget === EditTarget.Second
          ? `${state.firstvalue} ${state.operator} ${secondvalue}`
          : `${firstvalue}`,
    };
  }

  doubleSqrt(state, action) {
    const result = dotVerification(state.result);
    let firstvalue = state.firstvalue;
    let secondvalue = state.secondvalue;

    if (state.editStatus === EditStatus.EditFormula) {
      if (state.editTarget === EditTarget.Second) {
        secondvalue = `sqrt(${state.secondvalue})`;
      } else {
        firstvalue = `sqrt(${state.firstvalue})`;
      }
    } else if (state.editStatus === EditStatus.EditNumber) {
      if (state.editTarget === EditTarget.Second) {
        secondvalue = `sqrt(${result})`;
      } else {
        firstvalue = `sqrt(${result})`;
      }
    } else {
      if (state.editTarget === EditTarget.Second) {
        secondvalue = `sqrt(${result})`;
      } else {
        firstvalue = `sqrt(${result})`;
      }
    }

    let finalResult;
    let calculateResult =
      state.editTarget === EditTarget.Second
        ? eval(secondvalue)
        : eval(firstvalue);
    if (state.editStatus !== EditStatus.EditNumber) {
      finalResult = calculateResult;
    } else {
      finalResult = calculateResult;
    }

    let firstvalueConvert = String(firstvalue).replace(/sqrt/g, "√");
    let secondvalueConvert = String(secondvalue).replace(/sqrt/g, "√");

    if (isNaN(calculateResult) || calculateResult === undefined) {
      throw "Invalid input";
    }

    return {
      ...state,
      firstvalue: firstvalue,
      secondvalue: secondvalue,
      editStatus: EditStatus.EditFormula,
      result: finalResult,
      display:
        state.editTarget === EditTarget.Second
          ? `${firstvalueConvert} ${state.operator} ${secondvalueConvert}`
          : `${firstvalueConvert}`,
    };
  }
  reciprocal(state, action) {
    const result = dotVerification(state.result);
    let firstvalue = state.firstvalue;
    let secondvalue = state.secondvalue;

    if (state.editStatus === EditStatus.EditFormula) {
      if (state.editTarget === EditTarget.Second) {
        secondvalue = `recip(${state.secondvalue})`;
      } else {
        firstvalue = `recip(${state.firstvalue})`;
      }
    } else if (state.editStatus === EditStatus.EditNumber) {
      if (state.editTarget === EditTarget.Second) {
        secondvalue = `recip(${result})`;
      } else {
        firstvalue = `recip(${result})`;
      }
    } else {
      if (state.editTarget === EditTarget.Second) {
        secondvalue = `recip(${result})`;
      } else {
        firstvalue = `recip(${result})`;
      }
    }

    let finalResult;
    let calculateResult =
      state.editTarget === EditTarget.Second
        ? eval(secondvalue)
        : eval(firstvalue);
    if (state.editStatus !== EditStatus.EditNumber) {
      finalResult = calculateResult;
    } else {
      finalResult = calculateResult;
    }

    let firstvalueConvert = String(firstvalue).replace(/recip/g, "1/");
    let secondvalueConvert = String(secondvalue).replace(/recip/g, "1/");

    if (String(finalResult) === "Infinity") {
      throw "Cannot divide by zero";
    }

    return {
      ...state,
      firstvalue: firstvalue,
      secondvalue: secondvalue,
      editStatus: EditStatus.EditFormula,
      result: finalResult,
      display:
        state.editTarget === EditTarget.Second
          ? `${firstvalueConvert} ${state.operator} ${secondvalueConvert}`
          : `${firstvalueConvert}`,
    };
  }
  equal(state, action) {
    const result = String(dotVerification(state.result));

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

    const calculateResult = calculateNumbers(fomula, state);

    let displayFormula = String(fomula);
    if (String(fomula).includes("sqrt")) {
      displayFormula = String(fomula).replace(/sqrt/g, "√");
    }
    if (String(fomula).includes("recip")) {
      displayFormula = String(fomula).replace(/recip/g, "1/");
    }

    return {
      ...state,
      editTarget: EditTarget.First,
      firstvalue: result,
      secondvalue:
        state.editTarget === EditTarget.Second ? result : state.secondvalue,
      editStatus: EditStatus.NotEditting,
      result: calculateResult,
      display: `${displayFormula} ${action.type}`,
    };
  }
}

let calculator = new Calculator();

export default function calculateReducer(state, action) {
  try {
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

    switch (action.type) {
      case "+/-":
        return calculator.negate(state, action);
      case ".":
        return calculator.dot(state, action);
      case "Del":
        return calculator.del(state);
      case "CE":
        return calculator.ce(state);
      case "C":
        return initialState;
      case "x2":
        return calculator.square(state, action);
      case "2√x":
        return calculator.doubleSqrt(state, action);
      case "1/x":
        return calculator.reciprocal(state, action);
      case "=":
        return calculator.equal(state, action);
      default:
        return state;
    }
  } catch (e) {
    return {
      ...initialState,
      result: e,
      error: e,
      display: state.display,
    };
  }
}

function dotVerification(value) {
  return String(value).endsWith(".")
    ? parseFloat(String(value).slice(0, -1))
    : parseFloat(String(value));
}

function checkDivideZero(state) {
  if (String(state.operator) === "/" && String(state.result) === "0") {
    if (String(state.firstvalue) === "0") {
      throw "Result is undefined";
    }
    throw "Cannot divide by zero";
  }
}

function calculateNumbers(fomula, state) {
  checkDivideZero(state);
  return parseFloat(Number(eval(String(fomula)))); //.toExponential();
}

function resultLengthValidator(state) {
  const lengthOfResult = String(state.result).match(/\d/g).length;
  return String(state.result).replace("-", "").trim().startsWith("0")
    ? lengthOfResult > 16
    : lengthOfResult > 15;
}

function negate(value) {
  return -value;
}

function sqr(value) {
  return value * value;
}

function sqrt(value) {
  return Math.sqrt(value);
}

function recip(value) {
  return 1 / value;
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
