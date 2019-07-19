import * as ReactDOM from "react-dom"
import * as React from "react"
import {Root} from "./components/root";

const conf = {
    throttleMs: 100,
    span: 75,
    symbol: "XBTUSD"
}

const domContainer = document.querySelector('#main')
ReactDOM.render(<Root conf={conf}/>, domContainer)