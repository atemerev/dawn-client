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
        let eventListener = function (self, obj) {
            let table = obj.hasOwnProperty('table') ? obj.table : ''
            if (table.startsWith('orderBookL2')) {
                let ts = (new Date()).getTime()
                if (ts > lastTs + conf.throttleMs) {
                    lastTs = ts
                    let refBook = self.market['XBTUSD'].trim(50)
                    ReactDOM.render(
                        <DepthChart data={refBook} renderer='canvas'/>,
                        document.getElementById('depth-chart-container')
                    )
                }
            }
        }

        this.bitmexClient = new Bitmex(eventListener)
        let ws = await this.bitmexClient.connect('-8wFQuIdgNeJwdhrxfr58dvk', 'rvX8hVzDpf1m_ONXq1fC4iegyGYD3bgbZG1SksbuWYHD9qyq')
        this.bitmexClient.subscribe(ws, ['orderBookL2:XBTUSD', 'trade:XBTUSD'])
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