import React from 'react'
import ReactDOM from 'react-dom'
import {DepthChart} from './components/depthchart'
import {Bitmex} from "./vendor/bitmex"
import _ from 'lodash'

class App {

    constructor(conf) {
        this.conf = conf
        this.bitmexClient = new Bitmex()
        this.connected = false
    }

    async init() {
        let eventListener = function (self, obj) {
            let table = obj.hasOwnProperty('table') ? obj.table : ''
            if (table.startsWith('orderBookL2')) {
                let refBook = self.market['XBTUSD'].trim(50)
                let refData = _.concat(refBook.bids, refBook.offers)
                let chartData = {"book": refData}
                ReactDOM.render(
                    <DepthChart data={chartData} renderer='canvas'/>,
                    document.getElementById('depth-chart-container')
                )
            }
        }

        this.bitmexClient = new Bitmex(eventListener)
        let ws = await this.bitmexClient.connect('test', 'test')
        this.bitmexClient.subscribe(ws, ['orderBookL2:XBTUSD', 'trade:XBTUSD'])
    }

}

const conf = {
    span: 95,
    timeAxisHeight: 30,
    symbol: "XBTUSD",
    amountAxisWidth: 55
}

const app = new App(conf)

app.init().then(() => {
    console.log("Client initialized")
}).catch((err) => {
    console.error(err)
})