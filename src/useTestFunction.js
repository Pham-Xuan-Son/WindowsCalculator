import { useState, useEffect } from "react";
import { numberFormatter } from "./CalculateReducer";

// This is to avoid the error "Maximum update depth exceeded" displayed in the console
const originalConsoleError = console.error;
console.error = function (message, ...args) {
  if (
    typeof message === "string" &&
    message.includes("Maximum update depth exceeded")
  ) {
    // Do nothing for this specific error
    return;
  }
  originalConsoleError.apply(console, [message, ...args]);
};

const useTestFunction = (dispatch, formula) => {
  const [currentTestCase, setCurrentTestCase] = useState(null);
  const [test, setTest] = useState([]);
  const [testStatus, setTestStatus] = useState([]);
  const [display, setDisplay] = useState(false);

  useEffect(() => {
    if (test.length > 0) {
      const lastTestCase = test[0];
      setCurrentTestCase(lastTestCase);
      dispatch({ type: "C" });
      lastTestCase.input
        .trim()
        .split(" ")
        .forEach((char) => dispatch({ type: char }));
    } else {
      setDisplay(true);
    }
  }, [test, dispatch]);

  useEffect(() => {
    if (currentTestCase) {
      setTest((prev) => (prev.length > 0 ? prev.slice(1) : prev));
      setCurrentTestCase(null);
      let formattedValue = numberFormatter(String(formula.result));

      const debugId = "negate26.1";

      if (currentTestCase.id === debugId) {
        console.log(
          `Testcase: ${currentTestCase.id} ${
            String(formattedValue) ===
              String(currentTestCase.expected.result) &&
            String(formula.display) === String(currentTestCase.expected.formula)
              ? "Passed"
              : "Failed"
          }`
        );
        console.log("formula = ", {
          formula: formula.display,
          expected: currentTestCase.expected.formula,
        });
        console.log("result = ", {
          result: formattedValue,
          expected: currentTestCase.expected.result,
        });
      }
      if (
        String(formattedValue) === String(currentTestCase.expected.result) &&
        String(formula.display) === String(currentTestCase.expected.formula)
      ) {
        setTestStatus((prev) => [
          ...prev,
          {
            id: currentTestCase.id,
            passed: true,
            input: currentTestCase.input,
            result: String(formula.result),
            formula: formula.display,
            expectedResult: currentTestCase.expected.result,
            expectedFormula: currentTestCase.expected.formula,
          },
        ]);
      } else {
        setTestStatus((prev) => [
          ...prev,
          {
            id: currentTestCase.id,
            passed: false,
            input: currentTestCase.input,
            result: String(formula.result),
            formula: formula.display,
            expectedResult: currentTestCase.expected.result,
            expectedFormula: currentTestCase.expected.formula,
          },
        ]);
      }
    }
  }, [currentTestCase, formula.result, formula.display]);

  useEffect(() => {
    setDisplay(false);
    setCurrentTestCase(null);
    setTestStatus([]);
    setTest(testCases);
    console.log("Start Testing...");
  }, []);

  return [testStatus, display];
};

const testCases = [
  // test number
  {
    id: "num" + 1,
    input: "0",
    expected: {
      formula: "",
      result: "0",
    },
  },
  {
    id: "num" + 2,
    input: "0 0",
    expected: {
      formula: "",
      result: "0",
    },
  },
  {
    id: "num" + 3,
    input: "1 2 3 4",
    expected: {
      formula: "",
      result: "1,234",
    },
  },
  {
    id: "num" + 4,
    input: "0 1",
    expected: {
      formula: "",
      result: "1",
    },
  },
  {
    id: "num" + 5,
    input:
      "9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 =",
    expected: {
      formula: "9999999999999999 =",
      result: "9,999,999,999,999,999",
    },
  },
  {
    id: "num" + 5.1,
    input:
      "9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 Del Del 2 0 + 3 =",
    expected: {
      formula: "9999999999999920 + 3 =",
      result: "9,999,999,999,999,923",
    },
  },
  {
    id: "num" + 5.2,
    input: "1 2 3 4 5 6 7 8 9 1 2 3 4 5 6 7 8 9",
    expected: {
      formula: "",
      result: "1,234,567,891,234,567",
    },
  },
  {
    id: "num" + 6,
    input:
      ". 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 =",
    expected: {
      formula: "0.9999999999999999 =",
      result: "0.9999999999999999",
    },
  },
  {
    id: "num" + 6.1,
    input:
      ". 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 = + 1 =",
    expected: {
      formula: "0.9999999999999999 + 1 =",
      result: "2",
    },
  },
  {
    id: "num" + 6.2,
    input:
      ". 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 9 = + 1 - 1 =",
    expected: {
      formula: "2 - 1 =",
      result: "0.9999999999999999",
    },
  },
  {
    id: "num" + 7,
    input: "0 . 1 2 3 4 5 6 7 8 9 1 2 3 4 5 6 7 8 9 =",
    expected: {
      formula: "0.1234567891234567 =",
      result: "0.1234567891234567",
    },
  },
  {
    id: "num" + 8,
    input: "1 2 3 4 5 6 7. 1 2 3 4 5 6 7 8 9 1 2 3 4 5 6 7 8 9 =",
    expected: {
      formula: "1234567.123456789 =",
      result: "1,234,567.123456789",
    },
  },
  {
    id: "num" + 9,
    input: "1 = 6",
    expected: {
      formula: "1 =",
      result: "6",
    },
  },
  // test operator
  {
    id: "op" + 1,
    input: "+",
    expected: {
      formula: "0 +",
      result: "0",
    },
  },
  {
    id: "op" + 2,
    input: "+ + + +",
    expected: {
      formula: "0 +",
      result: "0",
    },
  },
  {
    id: "op" + 3,
    input: "+ - * / +",
    expected: {
      formula: "0 +",
      result: "0",
    },
  },
  {
    id: "op" + 4,
    input: "+ 1 2 3",
    expected: {
      formula: "0 +",
      result: "123",
    },
  },
  {
    id: "op" + 5,
    input: "1 2 3 . +",
    expected: {
      formula: "123 +",
      result: "123",
    },
  },
  {
    id: "op" + 6,
    input: "1 2 3 + 5",
    expected: {
      formula: "123 +",
      result: "5",
    },
  },
  {
    id: "op" + 7,
    input: "1 2 3 + 5 -",
    expected: {
      formula: "128 -",
      result: "128",
    },
  },
  {
    id: "op" + 8,
    input: "1 + 2 = /",
    expected: {
      formula: "3 /",
      result: "3",
    },
  },
  {
    id: "op" + 9,
    input: "1 + 2 = / * - + 3 -",
    expected: {
      formula: "6 -",
      result: "6",
    },
  },
  {
    id: "op" + 10,
    input: "1 / 0 =",
    expected: {
      formula: "1 /",
      result: "Cannot divide by zero",
    },
  },
  {
    id: "op" + 11,
    input: "2 - = +",
    expected: {
      formula: "0 +",
      result: "0",
    },
  },
  {
    id: "op" + 12,
    input: "1 6 . 3 2 - 1 6 =",
    expected: {
      formula: "16.32 - 16 =",
      result: "0.32",
    },
  },
  {
    id: "op" + 12.1,
    input: "1 6 . 3 - 1 6 =",
    expected: {
      formula: "16.3 - 16 =",
      result: "0.3",
    },
  },
  {
    id: "op" + 13,
    input: "6 + 6 = 6",
    expected: {
      formula: "",
      result: "6",
    },
  },
  {
    id: "op" + 14, // need fix
    input: "20 / 7 - 1 =",
    expected: {
      formula: "2.857142857142857 - 1 =",
      result: "1.857142857142857",
    },
  },
  {
    id: "op" + 15,
    input: "1 5 . 3 6 + 6 * 2 =",
    expected: {
      formula: "21.36 * 2 =",
      result: "42.72",
    },
  },
  {
    id: "op" + 16,
    input: "1 . 2 5 * 9 . 3 - 1 0 =",
    expected: {
      formula: "11.625 - 10 =",
      result: "1.625",
    },
  },
  {
    id: "op" + 17,
    input: "1 / 0 = =",
    expected: {
      formula: "",
      result: "0",
    },
  },
  {
    id: "op" + 17.1, // remove this after fix
    input: "1 / 0 = +",
    expected: {
      formula: "",
      result: "DISABLED",
    },
  },
  {
    id: "op" + 17.2,
    input: "1 / 0 = Del",
    expected: {
      formula: "",
      result: "0",
    },
  },
  {
    id: "op" + 17.3,
    input: "1 / 0 = Del 3 =",
    expected: {
      formula: "3 =",
      result: "3",
    },
  },
  {
    id: "op" + 18,
    input: "1 / 0 = 3 =",
    expected: {
      formula: "3 =",
      result: "3",
    },
  },
  {
    id: "op" + 18.1,
    input: "1 / 0 = CE 3 =",
    expected: {
      formula: "3 =",
      result: "3",
    },
  },
  {
    id: "op" + 19,
    input: "0 / 0 =",
    expected: {
      formula: "0 /",
      result: "Result is undefined",
    },
  },
  {
    id: "op" + 19.1,
    input: "0 / 0 = CE 3 =",
    expected: {
      formula: "3 =",
      result: "3",
    },
  },
  {
    id: "op" + 20,
    input: "2 + 2 . 0 =",
    expected: {
      formula: "2 + 2 =",
      result: "4",
    },
  },
  {
    id: "op" + 20.1,
    input: "2 . 0 +",
    expected: {
      formula: "2 +",
      result: "2",
    },
  },
  {
    id: "op" + 21,
    input: "5 0 / 7 * +/- = / 3 1 + 2 =",
    expected: {
      formula: "-1.645819618169849 + 2 =",
      result: "0.3541803818301514",
    },
  },
  {
    id: "op" + 22,
    input: "1 + 2 = 5 = 6",
    expected: {
      formula: "",
      result: "6",
    },
  },
  {
    id: "op" + 23,
    input: "1 2 3 4 5 6 7 8 9 1 2 3 4 5 6 7 8 9 * 1 2 3 =",
    expected: {
      formula: "1234567891234567 * 123 =",
      result: "1.518518506218517e+17",
    },
  },
  {
    id: "op" + 24,
    input: "1 2 3 . 4 5 6 7 8 9 1 2 3 4 5 6 7 8 9 * 1 2 3 =",
    expected: {
      formula: "123.4567891234567 * 123 =",
      result: "15,185.18506218517",
    },
  },
  {
    id: "op" + 25,
    input: "1 2 3 4 5 6 . 1 2 3 - 1 2 3 1 0 0 . 0 0 2 =",
    expected: {
      formula: "123456.123 - 123100.002 =",
      result: "356.121",
    },
  },
  {
    id: "op" + 26,
    input:
      "1 2 3 4 5 6 7 8 9 1 2 3 4 . 1 2 3 - 1 2 3 4 5 6 7 8 9 1 0 0 0 . 0 0 2 =",
    expected: {
      formula: "1234567891234.123 - 1234567891000.002 =",
      result: "234.121",
    },
  },
  {
    id: "op" + 27,
    input: "5 4 . 8 - 5 4 =",
    expected: {
      formula: "54.8 - 54 =",
      result: "0.8",
    },
  },
  {
    id: "op" + 28,
    input: "1 / 3 * 3 =",
    expected: {
      formula: "0.3333333333333333 * 3 =",
      result: "1",
    },
  },
  {
    id: "op" + 29,
    input:
      "0 . 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 * 4 . 5 =",
    expected: {
      formula: "0.2222222222222222 * 4.5 =",
      result: "0.9999999999999999",
    },
  },
  {
    id: "op" + 30,
    input: "9 / 0 +",
    expected: {
      formula: "9 / 0 +",
      result: "Cannot divide by zero",
    },
  },
  {
    id: "op" + 30.1,
    input: "9 = +/- / 0 +",
    expected: {
      formula: "negate(9) / 0 +",
      result: "Cannot divide by zero",
    },
  },
  {
    id: "op" + 31,
    input: "0 / 0 +",
    expected: {
      formula: "0 / 0 +",
      result: "Result is undefined",
    },
  },

  //test dot
  {
    id: "dot" + 1,
    input: ".",
    expected: {
      formula: "",
      result: "0.",
    },
  },
  {
    id: "dot" + 2,
    input: ". 6",
    expected: {
      formula: "",
      result: "0.6",
    },
  },
  {
    id: "dot" + 3,
    input: "2 + .",
    expected: {
      formula: "2 +",
      result: "0.",
    },
  },
  {
    id: "dot" + 4,
    input: "2 . 0 =",
    expected: {
      formula: "2 =",
      result: "2",
    },
  },
  {
    id: "dot" + 5,
    input: "10 + 2 = .",
    expected: {
      formula: "",
      result: "0.",
    },
  },
  {
    id: "dot" + 5 + "." + 1,
    input: "10 + 2 = . =",
    expected: {
      formula: "0 + 2 =",
      result: "2",
    },
  },
  {
    id: "dot" + 6,
    input: "10 + 2 . =",
    expected: {
      formula: "10 + 2 =",
      result: "12",
    },
  },
  {
    id: "dot" + 6.1,
    input: "10 + 2 . = 5 =",
    expected: {
      formula: "5 + 2 =",
      result: "7",
    },
  },
  {
    id: "dot" + 7,
    input: "5 + . +",
    expected: {
      formula: "5 +",
      result: "5",
    },
  },
  {
    id: "dot" + 8,
    input: "6 + 6 = 5 . +",
    expected: {
      formula: "5 +",
      result: "5",
    },
  },
  {
    id: "dot" + 9,
    input: "3 = .",
    expected: {
      formula: "3 =",
      result: "0.",
    },
  },
  //test negate
  {
    id: "negate" + 1,
    input: "+/-",
    expected: {
      formula: "",
      result: "0",
    },
  },
  {
    id: "negate" + 2,
    input: "2 +/- +/-",
    expected: {
      formula: "",
      result: "2",
    },
  },
  {
    id: "negate" + 3,
    input: "5 +/-",
    expected: {
      formula: "",
      result: "-5",
    },
  },
  {
    id: "negate" + 4,
    input: "0 . +/- =",
    expected: {
      formula: "0 =",
      result: "0",
    },
  },
  {
    id: "negate" + 5,
    input: "5 - +/-",
    expected: {
      formula: "5 - negate(5)",
      result: "-5",
    },
  },
  {
    id: "negate" + 6,
    input: "5 - +/- +/-",
    expected: {
      formula: "5 - negate(negate(5))",
      result: "5",
    },
  },
  {
    id: "negate" + 6.1,
    input: "5 - +/- +/- =",
    expected: {
      formula: "5 - negate(negate(5)) =",
      result: "0",
    },
  },
  {
    id: "negate" + 6.2,
    input: "5 - +/- = +/-",
    expected: {
      formula: "negate(10)",
      result: "-10",
    },
  },
  {
    id: "negate" + 7,
    input: "5 - +/- =",
    expected: {
      formula: "5 - negate(5) =",
      result: "10",
    },
  },
  {
    id: "negate" + 7.1,
    input: "5 - +/- = =",
    expected: {
      formula: "10 - -5 =",
      result: "15",
    },
  },

  {
    id: "negate" + 7.2,
    input: "5 - +/- = = =",
    expected: {
      formula: "15 - -5 =",
      result: "20",
    },
  },
  {
    id: "negate" + 7.3,
    input: "5 * +/-",
    expected: {
      formula: "5 * negate(5)",
      result: "-5",
    },
  },
  {
    id: "negate" + 7.4,
    input: "5 + +/- +",
    expected: {
      formula: "0 +",
      result: "0",
    },
  },
  {
    id: "negate" + 7.5,
    input: "5 + +/- 6 +/-",
    expected: {
      formula: "5 +",
      result: "-6",
    },
  },
  {
    id: "negate" + 7.6,
    input: "5 - +/- + =",
    expected: {
      formula: "10 + 10 =",
      result: "20",
    },
  },
  {
    id: "negate" + 7.7,
    input: "5 - +/- + +",
    expected: {
      formula: "10 +",
      result: "10",
    },
  },
  {
    id: "negate" + 7.8,
    input: "5 - +/- - +/-",
    expected: {
      formula: "10 - negate(10)",
      result: "-10",
    },
  },
  {
    id: "negate" + 7.9,
    input: "5 = 6 +/-",
    expected: {
      formula: "5 =",
      result: "-6",
    },
  },

  {
    id: "negate" + 8,
    input: "5 + +/- =",
    expected: {
      formula: "5 + negate(5) =",
      result: "0",
    },
  },
  {
    id: "negate" + 9,
    input: "5 + +/- = =",
    expected: {
      formula: "0 + -5 =",
      result: "-5",
    },
  },
  {
    id: "negate" + 10,
    input: "5 + +/- = = =",
    expected: {
      formula: "-5 + -5 =",
      result: "-10",
    },
  },
  {
    id: "negate" + 11,
    input: "= Del +/-",
    expected: {
      formula: "negate(0)",
      result: "0",
    },
  },
  {
    id: "negate" + 11.1,
    input: "= CE +/-",
    expected: {
      formula: "0 =",
      result: "0",
    },
  },
  {
    id: "negate" + 11.2,
    input: "= CE +/- 6",
    expected: {
      formula: "0 =",
      result: "6",
    },
  },
  {
    id: "negate" + 12,
    input: "5 = +/-",
    expected: {
      formula: "negate(5)",
      result: "-5",
    },
  },
  {
    id: "negate" + 13,
    input: "5 = +/- +/-",
    expected: {
      formula: "negate(negate(5))",
      result: "5",
    },
  },
  {
    id: "negate" + 14,
    input: "5 = +/- =",
    expected: {
      formula: "negate(5) =",
      result: "-5",
    },
  },
  {
    id: "negate" + 15,
    input: "5 = +/- = =",
    expected: {
      formula: "-5 =",
      result: "-5",
    },
  },
  {
    id: "negate" + 15.1,
    input: "5 = +/- 6 =",
    expected: {
      formula: "6 =",
      result: "6",
    },
  },
  {
    id: "negate" + 15.2,
    input: "5 = + +/-",
    expected: {
      formula: "5 + negate(5)",
      result: "-5",
    },
  },
  {
    id: "negate" + 15.3,
    input: "5 = + +/- =",
    expected: {
      formula: "5 + negate(5) =",
      result: "0",
    },
  },
  {
    id: "negate" + 15.4,
    input: "5 = +/- + =",
    expected: {
      formula: "negate(5) + -5 =",
      result: "-10",
    },
  },
  {
    id: "negate" + 15.5,
    input: "5 = . +/-",
    expected: {
      formula: "5 =",
      result: "-0.",
    },
  },
  {
    id: "negate" + 15.6,
    input: "5 = +/- 1 2 3 4 +/- Del",
    expected: {
      formula: "negate(5)",
      result: "-123",
    },
  },
  {
    id: "negate" + 16,
    input: "5 - = +/-",
    expected: {
      formula: "negate(0)",
      result: "0",
    },
  },
  {
    id: "negate" + 17,
    input: "5 + 6 +/-",
    expected: {
      formula: "5 +",
      result: "-6",
    },
  },
  {
    id: "negate" + 17.1,
    input: "5 + 6 +/- +/-",
    expected: {
      formula: "5 +",
      result: "6",
    },
  },
  {
    id: "negate" + 18,
    input: "5 + 6 = +/-",
    expected: {
      formula: "negate(11)",
      result: "-11",
    },
  },
  {
    id: "negate" + 18.1,
    input: "5 + 6 = +/- =",
    expected: {
      formula: "negate(11) + 6 =",
      result: "-5",
    },
  },
  {
    id: "negate" + 18.2,
    input: "5 + 6 = +/- +/-",
    expected: {
      formula: "negate(negate(11))",
      result: "11",
    },
  },
  {
    id: "negate" + 18.3,
    input: "5 + 6 = +/- = =",
    expected: {
      formula: "-5 + 6 =",
      result: "1",
    },
  },
  {
    id: "negate" + 19,
    input: "5 + . +/-",
    expected: {
      formula: "5 +",
      result: "-0.",
    },
  },
  {
    id: "negate" + 20,
    input: "5 - = +/- +/-",
    expected: {
      formula: "negate(negate(0))",
      result: "0",
    },
  },
  {
    id: "negate" + 21,
    input: "5 + = +/- +/-",
    expected: {
      formula: "negate(negate(10))",
      result: "10",
    },
  },
  {
    id: "negate" + 22,
    input: "5 - 7 = +/- +/-",
    expected: {
      formula: "negate(negate(-2))",
      result: "-2",
    },
  },
  {
    id: "negate" + 23,
    input: "0 - +/- = =",
    expected: {
      formula: "0 - 0 =",
      result: "0",
    },
  },
  {
    id: "negate" + 24,
    input: "3 = +/- -",
    expected: {
      formula: "negate(3) -",
      result: "-3",
    },
  },
  {
    id: "negate" + 25,
    input: "3 = +/- - +/-",
    expected: {
      formula: "negate(3) - negate(-3)",
      result: "3",
    },
  },
  {
    id: "negate" + 25.1,
    input: "3 = +/- - +/- =",
    expected: {
      formula: "negate(3) - negate(-3) =",
      result: "-6",
    },
  },
  {
    id: "negate" + 25.2,
    input: "3 = +/- * +/- * +/-",
    expected: {
      formula: "-9 * negate(-9)",
      result: "9",
    },
  },
  {
    id: "negate" + 26,
    input: "6 + = +/- -",
    expected: {
      formula: "negate(12) -",
      result: "-12",
    },
  },
  {
    id: "negate" + 26.1,
    input: "6 + = +/- - =",
    expected: {
      formula: "negate(12) - -12 =",
      result: "0",
    },
  },
  {
    id: "negate" + 26.2,
    input: "6 + = +/- - +",
    expected: {
      formula: "negate(12) +",
      result: "-12",
    },
  },
  {
    id: "negate" + 26.3,
    input: "6 + = +/- - +/-",
    expected: {
      formula: "negate(12) - negate(-12)",
      result: "12",
    },
  },
  {
    id: "negate" + 26.31,
    input: "6 + = +/- - +/- =",
    expected: {
      formula: "negate(12) - negate(-12) =",
      result: "-24",
    },
  },
  {
    id: "negate" + 26.4,
    input: "6 + = +/- - 4",
    expected: {
      formula: "negate(12) -",
      result: "4",
    },
  },
  {
    id: "negate" + 26.5,
    input: "6 + = +/- 4 =",
    expected: {
      formula: "4 + 6 =",
      result: "10",
    },
  },
  {
    id: "negate" + 27,
    input: "5 + = 3 +/-",
    expected: {
      formula: "",
      result: "-3",
    },
  },
  {
    id: "negate" + 28,
    input: "5 + 3 CE +/-",
    expected: {
      formula: "5 +",
      result: "0",
    },
  },
  {
    id: "negate" + 28.1,
    input: "5 + 3 Del +/-",
    expected: {
      formula: "5 +",
      result: "0",
    },
  },
  {
    id: "negate" + 28.2,
    input: "5 + = CE +/-",
    expected: {
      formula: "",
      result: "0",
    },
  },
  {
    id: "negate" + 28.3,
    input: "5 + CE +/-",
    expected: {
      formula: "5 +",
      result: "0",
    },
  },
  {
    id: "negate" + 29,
    input: "2 - 3 . +/- -",
    expected: {
      formula: "5 -",
      result: "5",
    },
  },
  {
    id: "negate" + 30,
    input: "5 - +/- .",
    expected: {
      formula: "5 -",
      result: "0.",
    },
  },
  {
    id: "negate" + 30.1,
    input: "5 - +/- . 5 =",
    expected: {
      formula: "5 - 0.5 =",
      result: "4.5",
    },
  },
  {
    id: "negate" + 31,
    input: "0 - +/- + +/-",
    expected: {
      formula: "0 + negate(0)",
      result: "0",
    },
  },
  {
    id: "negate" + 32,
    input: "3 + 3 + +/-",
    expected: {
      formula: "6 + negate(6)",
      result: "-6",
    },
  },
  {
    id: "negate" + 33,
    input: "6 - 3 +/- +",
    expected: {
      formula: "9 +",
      result: "9",
    },
  },
  //test square
  {
    id: "square" + 1,
    input: "x2",
    expected: {
      formula: "sqr(0)",
      result: "0",
    },
  },
  {
    id: "square" + 2,
    input: "5 x2",
    expected: {
      formula: "sqr(5)",
      result: "25",
    },
  },
  {
    id: "square" + 3,
    input: "5 + x2",
    expected: {
      formula: "5 + sqr(5)",
      result: "25",
    },
  },
  {
    id: "square" + 4,
    input: "5 x2 + 6 x2 =",
    expected: {
      formula: "sqr(5) + sqr(6) =",
      result: "61",
    },
  },
  {
    id: "square" + 5,
    input: "5 x2 +/-",
    expected: {
      formula: "negate(sqr(5))",
      result: "-25",
    },
  },
  {
    id: "square" + 6,
    input: "5 + x2 6",
    expected: {
      formula: "5 +",
      result: "6",
    },
  },
  {
    id: "square" + 7,
    input: "5 + . +/- x2",
    expected: {
      formula: "5 + sqr(0)",
      result: "0",
    },
  },
  {
    id: "square" + 8,
    input: "5 = +/- x2",
    expected: {
      formula: "sqr(negate(5))",
      result: "25",
    },
  },
  {
    id: "square" + 9,
    input: "5 = x2 Del",
    expected: {
      formula: "sqr(5)",
      result: "25",
    },
  },
  {
    id: "square" + 10,
    input: "5 + x2 CE",
    expected: {
      formula: "5 +",
      result: "0",
    },
  },
  //test 2√x
  {
    id: "2√x" + 1,
    input: "5 +/- = +/- 2√x + 9 2√x =",
    expected: {
      formula: "√(negate(-5)) + √(9) =",
      result: "5.23606797749979",
    },
  },
  {
    id: "2√x" + 2,
    input: "5 + +/- 2√x",
    expected: {
      formula: "5 + √(negate(5))",
      result: "Invalid input",
    },
  },
  //test 1/x
  {
    id: "1/x" + 1,
    input: "1/x",
    expected: {
      formula: "1/(0)",
      result: "Cannot divide by zero",
    },
  },
  {
    id: "1/x" + 2,
    input: "5 - CE 1/x",
    expected: {
      formula: "5 - 1/(0)",
      result: "Cannot divide by zero",
    },
  },
  {
    id: "1/x" + 3,
    input: "5 1/x / 1/x +/- =",
    expected: {
      formula: "1/(5) / negate(1/(0.2)) =",
      result: "-0.04",
    },
  },
  //test delete
  // -- case: Del
  {
    id: "del" + 1,
    input: "Del",
    expected: {
      formula: "",
      result: "0",
    },
  },
  {
    id: "del" + 2,
    input: "9 Del",
    expected: {
      formula: "",
      result: "0",
    },
  },
  {
    id: "del" + 3,
    input: "6 Del",
    expected: {
      formula: "",
      result: "0",
    },
  },
  {
    id: "del" + 4,
    input: "5 6 7 Del 4 Del",
    expected: {
      formula: "",
      result: "56",
    },
  },
  {
    id: "del" + 5,
    input: "1 + Del",
    expected: {
      formula: "1 +",
      result: "1",
    },
  },
  {
    id: "del" + 6,
    input: "1 + 2 = Del",
    expected: {
      formula: "",
      result: "3",
    },
  },
  {
    id: "del" + 7,
    input: "1 + 2 = Del = Del",
    expected: {
      formula: "", //3+2=
      result: "5",
    },
  },
  //   Test ID: del7 = Failed (Input=[1 + 2 = Del = Del]):
  // - Result=[5], Formula=[3 + 2 =]
  // - Expected: Result=[5], Formula=[]
  {
    id: "del" + 8,
    input: "5 + 2 = Del 5 =",
    expected: {
      formula: "5 + 2 =",
      result: "7",
    },
  },
  {
    id: "del" + 8.1,
    input: "5 + 2 = 5 = Del",
    expected: {
      formula: "",
      result: "7",
    },
  },
  {
    id: "del" + 9,
    input: "5 + 2 = Del 7 +",
    expected: {
      formula: "7 +",
      result: "7",
    },
  },
  {
    id: "del" + 10,
    input: "2 = Del",
    expected: {
      formula: "2 =",
      result: "2",
    },
  },
  {
    id: "del" + 10.1,
    input: "2 = Del 3",
    expected: {
      formula: "2 =",
      result: "3",
    },
  },
  {
    id: "del" + 11,
    input: "2 +/- = Del +/-",
    expected: {
      formula: "negate(-2)",
      result: "2",
    },
  },
  {
    id: "del" + 12,
    input: ". +/- Del",
    expected: {
      formula: "",
      result: "0",
    },
  },

  {
    id: "del" + 13,
    input: "2 + +/- Del",
    expected: {
      formula: "2 + negate(2)",
      result: "-2",
    },
  },

  // -- case: CE
  {
    id: "ce" + 1,
    input: "5 CE",
    expected: {
      formula: "",
      result: "0",
    },
  },
  {
    id: "ce" + 2,
    input: "5 6 7 8 9 + 2 CE",
    expected: {
      formula: "56789 +",
      result: "0",
    },
  },
  {
    id: "ce" + 3,
    input: "5 + 2 = CE",
    expected: {
      formula: "",
      result: "0",
    },
  },
  {
    id: "ce" + 4,
    input: "5 + 2 = CE =",
    expected: {
      formula: "0 + 2 =",
      result: "2",
    },
  },
  {
    id: "ce" + 4.1,
    input: "5 + 2 = CE = CE",
    expected: {
      formula: "",
      result: "0",
    },
  },
  {
    id: "ce" + 5,
    input: "5 + 2 = CE 5 + 3 = CE",
    expected: {
      formula: "",
      result: "0",
    },
  },
  {
    id: "ce" + 6,
    input: "5 + 2 = CE 5 + 3 = Del",
    expected: {
      formula: "",
      result: "8",
    },
  },
  {
    id: "ce" + 7,
    input: "5 + 2 = Del 5 + 3 = CE",
    expected: {
      formula: "",
      result: "0",
    },
  },
  {
    id: "ce" + 8,
    input: "5 + 2 = CE 5 =",
    expected: {
      formula: "5 + 2 =",
      result: "7",
    },
  },
  {
    id: "ce" + 9,
    input: "5 + 2 = CE 5 +",
    expected: {
      formula: "5 +",
      result: "5",
    },
  },
  {
    id: "ce" + 10,
    input: "5 = CE",
    expected: {
      formula: "5 =",
      result: "0",
    },
  },
  {
    id: "ce" + 10.1,
    input: "5 = CE 6",
    expected: {
      formula: "5 =",
      result: "6",
    },
  },
  {
    id: "ce" + 11,
    input: "5 + CE =",
    expected: {
      formula: "5 + 0 =",
      result: "5",
    },
  },
  {
    id: "ce" + 12,
    input: "5 = + CE",
    expected: {
      formula: "5 +",
      result: "0",
    },
  },
  {
    id: "ce" + 13,
    input: "3 + +/- CE",
    expected: {
      formula: "3 +",
      result: "0",
    },
  },
  {
    id: "ce" + 14,
    input: "3 = +/- CE",
    expected: {
      formula: "negate(3)",
      result: "0",
    },
  },
  {
    id: "ce" + 15,
    input: "1 + = +/- CE =",
    expected: {
      formula: "0 + 1 =",
      result: "1",
    },
  },
  // -- case: C
  {
    id: "c" + 1,
    input: "C",
    expected: {
      formula: "",
      result: "0",
    },
  },
  {
    id: "c" + 2,
    input: "5 6 7 8 9 + 2 + C",
    expected: {
      formula: "",
      result: "0",
    },
  },
  {
    id: "c" + 3,
    input: "5 + 2 = C",
    expected: {
      formula: "",
      result: "0",
    },
  },
  //test equal
  {
    id: "equal" + 1,
    input: "=",
    expected: {
      formula: "0 =",
      result: "0",
    },
  },
  {
    id: "equal" + 2,
    input: ". =",
    expected: {
      formula: "0 =",
      result: "0",
    },
  },
  {
    id: "equal" + 3,
    input: " 3 . =",
    expected: {
      formula: "3 =",
      result: "3",
    },
  },
  {
    id: "equal" + 4,
    input: " 3 + 2 =",
    expected: {
      formula: "3 + 2 =",
      result: "5",
    },
  },
  {
    id: "equal" + 5,
    input: " 3 + 2 = =",
    expected: {
      formula: "5 + 2 =",
      result: "7",
    },
  },
  {
    id: "equal" + 6,
    input: "4 5 - 1 0 0 0 0 0 =",
    expected: {
      formula: "45 - 100000 =",
      result: "-99,955",
    },
  },
  {
    id: "equal" + 7,
    input: "1 + 2 = 2 =",
    expected: {
      formula: "2 + 2 =",
      result: "4",
    },
  },
];

export default useTestFunction;
