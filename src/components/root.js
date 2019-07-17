import React from "react"
import * as ReactDOM from "react-dom"
import {Bitmex} from "../vendor/bitmex"
import {DepthChart} from "./depthchart"
import {LoginForm} from "./loginform"
import * as _ from "lodash"

export class Root extends React.Component {
    constructor(props) {
        super(props)
        this.bitmexClient = new Bitmex()
        this.state = {
            uiState: 'offline', // or online
            chartData: {},
            credentials: {}
        }
    }

    handleSubmit = (credentials) => {
        this.setState({credentials: credentials}, () => {
            this.init().then(() => console.log("Client initialized"))
        })
    }

    async init() {
        const conf = {
            throttleMs: 150,
            trimOrders: 10,
            span: 95,
            timeAxisHeight: 30,
            symbol: "XBTUSD",
            amountAxisWidth: 55
        }
        let lastTs = 0
        let chartData = {'bids': [], 'offers': [], 'orders': []}
        let eventListener = function (self, obj) {
            let table = obj.hasOwnProperty('table') ? obj.table : ''
            if (table.startsWith('orderBookL2')) {
                let ts = (new Date()).getTime()
                if (ts > lastTs + conf.throttleMs) {
                    lastTs = ts
                    let refBook = self.market['XBTUSD'].trim(conf.trimOrders)
                    Object.assign(chartData, {'bids': refBook.bids, 'offers': refBook.offers})
                    let dataCopy = Object.assign({}, chartData)
                    this.setState({chartData: dataCopy})
                }
            } else if (table === 'order' && obj.action === 'partial') {
                let myOrders = _.values(self.tables.order)
                Object.assign(chartData, {'orders': myOrders})
                let dataCopyOrders = Object.assign({}, chartData)
                this.setState({chartData: dataCopyOrders})
            }
        }.bind(this)

        this.bitmexClient = new Bitmex(eventListener)
        // let ws = await this.bitmexClient.connect('VRljkeAiXH80mRndOA0TuBfY', 'sgJWLHhtOiIGXYJaeEhtLLMLFiH_aSawmI7lwLswHSsm_r1M')
        let ws = await this.bitmexClient.connect(this.state.credentials.bitmexApiKey, this.state.credentials.bitmexSecret)
        this.setState({uiState: 'online'})
        this.bitmexClient.subscribe(ws, ['orderBookL2:XBTUSD', 'trade:XBTUSD', 'order', 'position'])
    }

    render() {
        let header = null
        if (this.state.uiState === 'offline') {
            header = <LoginForm handleSubmit={this.handleSubmit.bind(this)}/> // todo bind incorrect, see why not working
        } else {
            // todo display statistics
            header = <span id={'connected'}>Connected!</span>
        }

        let main = (this.state.uiState === 'online') ? <DepthChart data={this.state.chartData} renderer='svg'/> : null

        return (
            <div id={'root'}>
                <header>
                    <h1>BitMEX HF Visualizer</h1>
                    {header}
                </header>
                <main id={'chart'}>
                    {main}
                </main>
                <footer>
                    &copy; 2019 Reactivity.AI
                </footer>
            </div>
        )
    }
}
