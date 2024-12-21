import "./App.css";
import React, { useState, useReducer, useMemo, useEffect, useRef } from "react";
import InputField from "./InputField";
import ButtonsInterface from "./ButtonsInterface";
import ButtonBox from "./ButtonBox";
import useTestFunction from "./useTestFunction";
import calculateReducer, {
  initialState,
  numberFormatter,
} from "./CalculateReducer";

const calculate = [
  ["%", "CE", "C", "Del"],
  ["1/x", "x2", "2√x", "/"],
  ["7", "8", "9", "*"],
  ["4", "5", "6", "-"],
  ["1", "2", "3", "+"],
  ["+/-", "0", ".", "="],
];

const notDisabledBtns = "0 1 2 3 4 5 6 7 8 9 CE C Del =";

function App() {
  const [formula, dispatch] = useReducer(calculateReducer, initialState);

  const [showTests, setShowTests] = useState(false);
  const [testStatus, display] = useTestFunction(dispatch, formula, showTests);

  const error = useMemo(() => {
    return formula.error;
  }, [formula.error]);
  return (
    <div
      className="App"
      style={{
        backgroundColor: "#141414",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        // justifyContent: "center",
        color: "white",
        alignItems: "center",
      }}
    >
      <div style={{ width: "230px" }}>
        <div>
          <h4>Windows Calculator Test</h4>
        </div>
        <div>
          <InputField values={formula.display} />
        </div>
        <div style={{ marginBottom: "5px" }}>
          <InputField values={numberFormatter(formula.result)} />
        </div>
        <div>
          <MemoButton dispatch={dispatch} error={error} />
        </div>
      </div>
      <button
          style={{ marginTop: "10px" }}
          onClick={() => setShowTests(prev => !prev)}
        >
          {showTests ? "Hide Tests" : "Show Tests"}
        </button>   
      {showTests && (
      <TestResultMemo testStatus={testStatus} display={display} />)}
    </div>
  );
}

const TestResultMemo = React.memo(({ testStatus, display }) => {
  return (
    <>
      {display === true ? (
        <div style={{ display: "flex" }}>
          <TestSummary testStatus={testStatus} />
          <div style={{ display: "flex", flexDirection: "column" }}>
            <TestChanges testStatus={testStatus} />
            <TestDetails testStatus={testStatus} />
          </div>
        </div>
      ) : null}
    </>
  );
});

const TestDetails = ({ testStatus }) => {
  return (
    <div>
      <div>
        <h4>Test Details</h4>
      </div>
      <div
        style={{
          paddingLeft: "10px",
          paddingRight: "10px",
          maxHeight: "600px",
          overflowX: "auto",
        }}
      >
        <div>
          {testStatus.map((status, index) => (
            <div
              key={index}
              style={{
                textAlign: "left",
                whiteSpace: "pre-line",
                display: "flex",
                color: !status.passed ? "red" : "lightgreen",
                marginBottom: "5px",
              }}
            >
              {status.passed
                ? `Test ID: ${status.id} = Passed`
                : `Test ID: ${status.id} = Failed (Input=[${status.input}]): \n- Result=[${status.result}], Formula=[${status.formula}] \n- Expected: Result=[${status.expectedResult}], Formula=[${status.expectedFormula}]`}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

function TestSummary({ testStatus }) {
  const { totalTestCase, testFailed, testPassed } = testStatus.reduce(
    (acc, status) => {
      if (status.passed) {
        acc.testPassed++;
      } else {
        acc.testFailed++;
      }
      acc.totalTestCase++;
      return acc;
    },
    { totalTestCase: 0, testFailed: 0, testPassed: 0 }
  );

  return (
    <div>
      <div>
        <h4>Test Summary</h4>
      </div>
      <div
        style={{
          paddingLeft: "10px",
          paddingRight: "10px",
          maxHeight: "600px",
          overflowX: "auto",
          textAlign: "left",
        }}
      >
        <div>
          <div>Total Test Case: {totalTestCase}</div>
          <div style={{ color: "red" }}>Test Failed: {testFailed}</div>
          <div style={{ color: "lightgreen" }}>Test Passed: {testPassed}</div>
          <Debug text={{ totalTestCase, testFailed, testPassed }} />
        </div>
      </div>
    </div>
  );
}

function TestChanges({ testStatus }) {
  const [changes, setChanges] = useState({});
  const hasCompared = useRef(false);

  useEffect(() => {
    if (!hasCompared.current) {
      const lastTestJSON = sessionStorage.getItem("testStatus")
      if (lastTestJSON) {
        const previousTestStatus = JSON.parse(lastTestJSON);
  
        if (previousTestStatus && Array.isArray(previousTestStatus)) {
          const changes = {};
          testStatus.forEach((status) => {
            changes[status.id] = {
              id: status.id,
              new: {
                result: status.result,
                formula: status.formula,
                passed: status.passed,
              },
              input: status.input,
              expected: {
                result: status.expectedResult,
                formula: status.expectedFormula,
              },
            };
          });
          previousTestStatus.forEach((status) => {
            if (!changes[status.id]) {
              changes[status.id] = {};
            }
            if (changes[status.id].new && changes[status.id].new.passed !== status.passed) {
              changes[status.id].old = {
                result: status.result,
                formula: status.formula,
                passed: status.passed,
              };
            } else {
              delete changes[status.id];
            }
          });
          setChanges(changes);
          hasCompared.current = true;
        }
      }

      sessionStorage.setItem("testStatus", JSON.stringify(testStatus));
    }
  }, [testStatus]);

  if (Object.values(changes).length === 0) {
    return null;
  }
  return (
    <div>
      <div>
        <h4>New Test Changes</h4>
      </div>
      <div
        style={{
          paddingLeft: "10px",
          paddingRight: "10px",
          maxHeight: "600px",
          overflowX: "auto",
        }}
      >
        <div>
          {Object.values(changes).map((status, index) => (
            <div
              key={index}
              style={{
                textAlign: "left",
                display: "flex",
                color: !status.new.passed ? "red" : "lightgreen",
              }}
            >
              {status.old ? (
                <p style={{ marginTop: 0, marginBottom: "5px" }}>
                  Test ID: {status.id} =&nbsp;
                  {status.old ? (
                    <span
                      style={{
                        color: status.old.passed ? "lightgreen" : "red",
                      }}
                    >
                      {" "}
                      {status.old.passed ? "Passed" : "Failed"}{" "}
                    </span>
                  ) : (
                    ""
                  )}{" "}
                  &nbsp;{"=>"}&nbsp;{" "}
                  <span
                    style={{ color: status.new.passed ? "lightgreen" : "red" }}
                  >
                    {" "}
                    {status.new.passed ? "Passed" : "Failed"}{" "}
                  </span>{" "}
                  {` | Input = [${status.input}]`}
                  <br />- Result:&nbsp;
                  <span
                    style={{ color: status.old.passed ? "lightgreen" : "red" }}
                  >{`[${status.old ? status.old.result : ""}]`}</span>
                  &nbsp;{"=>"}&nbsp;
                  <span
                    style={{ color: status.new.passed ? "lightgreen" : "red" }}
                  >{`[${status.new.result}]`}</span>
                  <br />- Formula:&nbsp;
                  <span
                    style={{ color: status.old.passed ? "lightgreen" : "red" }}
                  >{`[${status.old ? status.old.formula : ""}]`}</span>
                  &nbsp;{"=>"}&nbsp;
                  <span
                    style={{ color: status.new.passed ? "lightgreen" : "red" }}
                  >{`[${status.new.formula}]`}</span>
                  <br />- Expected: Result =&nbsp;
                  {`[${status.expected.result}]`} ; Formula =&nbsp;
                  {`[${status.expected.formula}]`}
                </p>
              ) : (
                <p style={{ marginTop: 0, marginBottom: "5px" }}>
                  New Test ID: {status.id} =&nbsp;
                  <span
                    style={{ color: status.new.passed ? "lightgreen" : "red" }}
                  >
                    {" "}
                    {status.new.passed ? "Passed" : "Failed"}{" "}
                  </span>{" "}
                  | Input = [{status.input}]
                  <br />- Result:&nbsp;
                  <span
                    style={{ color: status.new.passed ? "lightgreen" : "red" }}
                  >
                    {`[${status.new.result}]`}
                  </span>
                  <br />- Formula:&nbsp;
                  <span
                    style={{ color: status.new.passed ? "lightgreen" : "red" }}
                  ></span>
                  {`[${status.new.formula}]`}
                  <br />- Expected: Result =&nbsp;
                  {`[${status.expected.result}]`} ; Formula =&nbsp;
                  {`[${status.expected.formula}]`}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const MemoButton = React.memo(({ dispatch, error }) => {
  return (
    <ButtonBox>
      {calculate.flat().map((btn, index) => (
        <ButtonsInterface
          key={index}
          value={btn}
          onClick={() => {
            dispatch({ type: btn });
          }}
          condition={
            error !== null ? !notDisabledBtns.split(" ").includes(btn) : false
          }
        />
      ))}
    </ButtonBox>
  );
});

const Debug = ({ text }) => {
  console.log(text);
  return null;
};

export default App;
