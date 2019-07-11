import React from 'react'
import ReactDOM from 'react-dom'
import {DepthChart} from './components/depthchart'
import {Bitmex} from "./vendor/bitmex"

class App {

    constructor(conf) {
        this.conf = conf
        this.bitmexClient = new Bitmex()
        this.connected = false
    }

    async init() {
        let lastTs = 0
        let chartData = {'bids': [], 'offers': [], 'orders': []}
        let eventListener = function (self, obj) {
            let table = obj.hasOwnProperty('table') ? obj.table : ''
            if (table.startsWith('orderBookL2')) {
                let ts = (new Date()).getTime()
                if (ts > lastTs + conf.throttleMs) {
                    lastTs = ts
                    let refBook = self.market['XBTUSD'].trim(50)
                    Object.assign(chartData, {'bids': refBook.bids, 'offers': refBook.offers})
                    let dataCopy = Object.assign({}, chartData)
                    ReactDOM.render(
                        <DepthChart data={dataCopy} renderer='canvas'/>,
                        document.getElementById('depth-chart-container')
                    )
                }
            } else if (table === 'order' && obj.action === 'partial') {
                let myOrders = obj.data
                Object.assign(chartData, {'orders': myOrders})
                let dataCopyOrders = Object.assign({}, chartData)
                // ReactDOM.render(
                //     <DepthChart data={dataCopyOrders} renderer='canvas'/>,
                //     document.getElementById('depth-chart-container')
                // )
            } else if (!table.startsWith('trade')) {
                console.log(JSON.stringify(obj))
            }
        }

        this.bitmexClient = new Bitmex(eventListener)
        let ws = await this.bitmexClient.connect('VRljkeAiXH80mRndOA0TuBfY', 'sgJWLHhtOiIGXYJaeEhtLLMLFiH_aSawmI7lwLswHSsm_r1M')
        this.bitmexClient.subscribe(ws, ['orderBookL2:XBTUSD', 'trade:XBTUSD', 'order', 'position'])
    }

}

const conf = {
    throttleMs: 100,
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