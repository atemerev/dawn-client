import React from "react"
import * as ReactDOM from "react-dom"
import {Bitmex} from "../vendor/bitmex"
import {LoginForm} from "./loginform"
import * as _ from "lodash"
import {DepthChart} from "./vxchart";
import {OrderBook} from "../lib/orderbook";

export class Root extends React.Component {
    constructor(props) {
        super(props)
        this.bitmexClient = new Bitmex()
        this.state = {
            uiState: 'offline', // or online
            chartData: {
                bids: [], offers: [], orders: []
            },
            credentials: {}
        }
    }

    handleSubmit = (credentials) => {
        this.setState({credentials: credentials}, () => {
            this.init().then(() => console.log("Client initialized"))
        })
    }

    async init() {
        let lastTs = 0
        let chartData = {'bids': [], 'offers': [], 'orders': []}
        let eventListener = function (self, obj) {
            let table = obj.hasOwnProperty('table') ? obj.table : ''
            if (table.startsWith('orderBookL2')) {
                let ts = (new Date()).getTime()
                if (ts > lastTs + this.props.conf.throttleMs) {
                    lastTs = ts
                    // let refBook = self.market['XBTUSD'].trim(conf.trimOrders)
                    let refBook = trimPriceRange(self.market[this.props.conf.symbol], this.props.conf.span)
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
            header = <LoginForm handleSubmit={this.handleSubmit}/>
        } else {
            // todo display statistics
            header = <span id={'connected'}>Connected!</span>
        }

        let main = (this.state.uiState === 'online' && this.state.chartData.bids.length > 0) ? <DepthChart data={this.state.chartData} span={this.props.conf.span}/> : null

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

function trimPriceRange(orderBook, priceDelta) {
    let avg = (orderBook.bids[0].price + orderBook.offers[0].price) / 2
    let filteredBids = _.takeWhile(orderBook.bids, (e) => e.price > avg - priceDelta)
    let filteredOffers = _.takeWhile(orderBook.offers, (e) => e.price < avg + priceDelta)
    return new OrderBook(orderBook.symbol, filteredBids, filteredOffers)
}