import './App.css';
import { useState, useEffect, useRef } from 'react';
import Draggable from "react-draggable";

//nagetive number
//scientific notation
const NUMBER_FORMATTER = new Intl.NumberFormat("en")
const PARENTHESIS_REGEX = /\((?<equation>[^\(\)]*)\)/
const MULTIPLY_DIVIDE_REGEX =
  /(?<operand1>[0-9]+)\s*(?<operation>[\/\*])\s*(?<operand2>[0-9]+)/
const EXPONENT_REGEX = /(?<operand1>[0-9]+)\s*(?<operation>\^)\s*(?<operand2>[0-9]+)/
const ADD_SUBTRACT_REGEX =
  /(?<operand1>[0-9]+)\s*(?<operation>(?<!e)[\-\+])\s*(?<operand2>[0-9]+)/

function parse(equation) {
    if (equation.match(PARENTHESIS_REGEX)) {
      const subEquation = equation.match(PARENTHESIS_REGEX).groups.equation
      const result = parse(subEquation)
      const newEquation = equation.replace(PARENTHESIS_REGEX, result)
      return parse(newEquation)
    } else if (equation.match(EXPONENT_REGEX)) {
      const result = handleMath(equation.match(EXPONENT_REGEX).groups)
      const newEquation = equation.replace(EXPONENT_REGEX, result)
      return parse(newEquation)
    } else if (equation.match(MULTIPLY_DIVIDE_REGEX)) {
      const result = handleMath(equation.match(MULTIPLY_DIVIDE_REGEX).groups)
      const newEquation = equation.replace(MULTIPLY_DIVIDE_REGEX, result)
      return parse(newEquation)
    } else if (equation.match(ADD_SUBTRACT_REGEX)) {
      const result = handleMath(equation.match(ADD_SUBTRACT_REGEX).groups)
      const newEquation = equation.replace(ADD_SUBTRACT_REGEX, result)
      return parse(newEquation)
    } else {
      return parseFloat(equation) > 2 ** 32 ? "Over Number Limit" : NUMBER_FORMATTER.format(equation)
    }
  }
  
function handleMath({ operand1, operand2, operation }) {
    const number1 = parseFloat(operand1)
    const number2 = parseFloat(operand2)
  
    const calculator = new Map()
    calculator.set("*", number1 * number2)
    calculator.set("/", number1 / number2)
    calculator.set("+", number1 + number2)
    calculator.set("-", number1 - number2)
    calculator.set("^", number1 ** number2)
  
    return calculator.get(operation) || ""
  }

  const isNumber = (charCode) =>{
    return charCode >= '0'.charCodeAt(0) &&
    charCode <= '9'.charCodeAt(0);
  } 

function updateOperationLogic(typeChar, charCode, preOutput, setResult, operation, setCurOperatorFontSize){

  if(isNumber(charCode)){
    if(preOutput === "0"){
      return typeChar
    }

    // can't type ex:(2+3)3 
    if(preOutput.slice(-1) === ")") return preOutput

    return preOutput+ typeChar
  } else if(typeChar === "(" || typeChar === ")"){
    //if count of "(" is even, can't type ")"
    const countOfLeftParenthesis = preOutput.split("").filter(char => char === "(").length 

    if(preOutput === "0" && typeChar === "(") return "("

    if((countOfLeftParenthesis % 2 === 0) && typeChar === ")") return preOutput
    
    if(typeChar === "(" && isNumber(preOutput.slice(-1).charCodeAt(0))) return preOutput

    return preOutput+ typeChar
  }else if(typeChar === "*" || typeChar === "+" || typeChar === "-" || typeChar === "/" || typeChar === "^"){
    if(preOutput == null) return "0"

    if(preOutput.slice(-1) === "*" || preOutput.slice(-1) === "+" || preOutput.slice(-1) === "-" || preOutput.slice(-1) === "/" || preOutput.slice(-1) === "^" || preOutput.slice(-1) === "("){
      return preOutput.slice(0, -1) + typeChar
    }

    return preOutput+ typeChar 
  //Backspace
  }else if(typeChar === "backspace" && preOutput != null){
    return preOutput.slice(0, -1)

  //Enter
  }else if(typeChar === "enter" || typeChar === "="){
    setResult(parse(operation))
    setCurOperatorFontSize(48)
    return "0"
  }
  //Delete
   else if(typeChar === "delete"){
    setResult("")
    setCurOperatorFontSize(48)
    return "0"
  } else{
    return preOutput
  }
}

function App() {
  const [result, setResult] = useState("")
  const [operation, setOperation] = useState("0")
  const [curOperatorFontSize, setCurOperatorFontSize] = useState(48)
  const curOperatorRef = useRef()

  const screenWidth = window.innerWidth

  console.log(screenWidth)

  const handleClickEvent = (e) =>{
    console.log(e.target.value)
    const charCode = e.target.value.charCodeAt(0);
    const typeChar = e.target.value;
    setOperation(preOutput => {
      return updateOperationLogic(typeChar, charCode, preOutput, setResult, operation, setCurOperatorFontSize)
    })
  }

  const clearAll = () => {
    setOperation("0")
    setResult("")
    setCurOperatorFontSize(48)
  }


  // front-size for curPerator should be smaller and smaller
  const curOperatorRefWidth = curOperatorRef.current  ? curOperatorRef.current.offsetWidth : 0
  
  useEffect(() => {
    console.log(curOperatorRefWidth)
    if(curOperatorRefWidth >= 195){
      setCurOperatorFontSize(curFontSize => parseFloat(curFontSize) * 0.88)
    }  
  }, [curOperatorRefWidth])

  // for press key event
  useEffect(()=>{
    const onPressKey = (e)=>{
      const charCode = e.key.toLowerCase().charCodeAt(0);
      const typeChar = e.key.toLowerCase();
  
      setOperation(preOutput => {
        return updateOperationLogic(typeChar, charCode, preOutput, setResult, operation, setCurOperatorFontSize)
      })
    }
  
    window.addEventListener('keydown', onPressKey)

    return () => window.removeEventListener('keydown', onPressKey)

  }, [operation])

  return (
    <div>
      <Draggable handle='.drag-handler' disabled={screenWidth > 500 ? false : true}>
        <div>
          <div className="calculator-grid">
                <div className="output drag-handler">
                  <div className="titlebar">
                  {/* Close Button Link */}
                    <div className="close">
                      <a className="closebutton" href="#">
                        <span><strong>x</strong></span>
                      </a>
                    </div>
                  {/* Minimize Button Link */}
                    <div className="minimize">
                      <a className="minimizebutton" href="#">
                        <span><strong>+</strong></span>
                      </a>
                    </div>
                  {/*  Zoom button link */}
                    <div className="zoom">
                      <a className="zoombutton" href="#">
                        <span><strong>+</strong></span>
                      </a>
                    </div>
                  </div>
                  <div data-previous-operand className='previous-operand'>{parseFloat(result) > 2 ** 32 ? "Over Number Limit" : result}</div>
                  <div data-current-operand className="current-operand" ref={curOperatorRef} 
                  style={{fontSize: `${curOperatorFontSize}px`}}
                  >{operation}</div>
                </div>
                <button data-all-clear onClick={clearAll}>AC</button>
                <button data-sign-change onClick={handleClickEvent} value="^">sqr</button>
                <button data-parentheses onClick={handleClickEvent} value="">%</button>
                <button data-operation onClick={handleClickEvent} value="/">÷</button>
                <button data-number onClick={handleClickEvent} value="7">7</button>
                <button data-number onClick={handleClickEvent} value="8">8</button>
                <button data-number onClick={handleClickEvent} value="9">9</button>
                <button data-operation onClick={handleClickEvent} value="+">+</button>
                <button data-number onClick={handleClickEvent} value="4">4</button>
                <button data-number onClick={handleClickEvent} value="5">5</button>
                <button data-number onClick={handleClickEvent} value="6">6</button>
                <button data-operation onClick={handleClickEvent} value="*">×</button>
                <button data-number onClick={handleClickEvent} value="1">1</button>
                <button data-number onClick={handleClickEvent} value="2">2</button>
                <button data-number onClick={handleClickEvent} value="3">3</button>
                <button data-operation onClick={handleClickEvent} value="-">-</button>
                <button data-number onClick={handleClickEvent} className="span-two" value="0">0</button>
                <button data-number onClick={handleClickEvent} value=".">.</button>
                <button data-equals onClick={() => {
                  setResult(parse(operation))
                  setOperation("0")
                  setCurOperatorFontSize(48)
                  }
                  }>=</button>
            </div>
        </div>
      </Draggable>
    </div>
  );
}

export default App;
