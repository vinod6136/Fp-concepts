import React, { useState, useRef, useEffect } from "react";
import { fromEvent } from "rxjs";
import { filter } from "rxjs/operators";

import Interpreter from "./interpreter";
import Visitor from "./visitor";
import "./App.css";
import acorn = require("acorn");

const App = () => {
  // hook for input value
  const [inputValue, setInputValue] = useState("");
  // hook for history of text typed
  const [history, setHistory] = useState([]);
  // hook for array of input value
  const [inputValueHistory, setInputValueHistory] = useState([]);
  // varaible to store recent values entered
  let recentValues = [];
  // variable to traverse through recentValues
  let pos = useRef(0);
  // reference of HTMLInputElement
  const inputRef = useRef(null);
  // current reference of HTMLInputElement
  let consoleField = inputRef.current;

  // function to be invoked everytime HTMLInput element updates
  const updateInputValue = () => {
    setInputValue(inputRef.current.value);
  };


  useEffect(() => {
    // variable to capture 'keyup' event of 'Shift' + 'Enter' key with help of reference
    const createKeyUpShiftEnter = fromEvent(consoleField, "keyup").pipe(
      filter((event: KeyboardEvent) => event.keyCode === 13 && !event.shiftKey)
    );

    // variable to capture 'keyup' event of 'Enter' key
    const createKeyUpWithCustomKey = (htmlTag, KEY_BOARD_KEY) =>
      fromEvent(htmlTag, "keyup").pipe(
        filter((event: KeyboardEvent) => event.key === KEY_BOARD_KEY)
      );

      // subscribing to events
    if (consoleField !== null && undefined) {
      createKeyUpShiftEnter.subscribe((event) => event.preventDefault());

      let inputFieldWhileArrowUp = createKeyUpWithCustomKey(consoleField, "ArrowUp");
      let inputFieldWhileArrowDown = createKeyUpWithCustomKey(
        consoleField,
        "ArrowDown"
      );
      // subscribing to arrow up events
      inputFieldWhileArrowUp.subscribe(() => {
        if (recentValues.length > 0 && pos.current >= 0) {
          setInputValue(
            recentValues[pos.current] ? recentValues[pos.current] : ""
          );
          pos.current = pos.curent - 1;
        }
      });

      // subscibing to arrow down events
      inputFieldWhileArrowDown.subscribe(() => {
        if (recentValues.length > 0 && pos.current < recentValues.length) {
          setInputValue(
            recentValues[pos.curent] ? recentValues[pos.current] : ""
          );
          pos.current = pos.current + 1;
        }
      });
    }
  });

  // function to be invoked by 'onKeyDown' event
  const onKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      parseInput();
    }
  };

  // parsing input capture by `onKeyDown` method
  const parseInput = () => {
    // trimmed value capture by event
    const value = inputRef.current.value.trim();
    // empty value
    let eValue = "";
    if (value) {
      // if declaration variables then no need to parse and print value
      if (!/(var|let|const)/.test(value)) {
        eValue = `print(${value})`;
      }
      try {
        // see acorn documentation for usage of 'acorn.prase()'
        //@ts-ignore
        const body = acorn.parse(eValue || value, { ecmaVersion: 2020 }).body;
        // calling js interpreter with helper classes 'Interpreter' and 'Visitor'
        //@ts-ignore
        const jsInterpreter = new Interpreter(new Visitor());
        // passing body to js interpreter
        jsInterpreter.interpret(body);
        // getting the value from js interpreter
        const answer = jsInterpreter.getValue();
        // final result to be shown in the screen
        const finalResult = answer ? value + "    =  " + answer : value;
        // storing final result and previous history in history
        setHistory((prevHistory) => [...prevHistory, finalResult]);
        // storing prev value and value to input value history
        setInputValueHistory((prevValue) => [...prevValue, value]);
        // storing input values in recentValues
        recentValues.push(...inputValueHistory, value);
        pos.current = recentValues.length;
        // clearing input field
        setInputValue("");
      } catch {}
    }
  };

  // history data to be rendered
  const renderData = (item, index) => {
    return (
      <div key={index} className="history-item">
        <span className="history-item-decoration"> ></span>
        {item}
      </div>
    );
  };

  return (
    <div className="container">
      <div>
        <div className="history">{history.length > 0 && history.map(renderData)}</div>
        <div className="input-container">
          <span> ></span>
          <input
            className="input"
            id="console"
            ref={inputRef}
            value={inputValue}
            onChange={updateInputValue}
            onKeyDown={onKeyDown}
            autoFocus
          />
        </div>
      </div>
    </div>
  );
};

export default App;
