import React from "react"
import * as ReactDOM from "react-dom"
import {Bitmex} from "../vendor/bitmex"
import {LoginForm} from "./loginform"
import * as _ from "lodash"
import {DepthChart} from "./vxchart";
import {OrderBook} from "../lib/orderbook";
import SpanSelector from "./spanselector";

export class Root extends React.Component {
    constructor(props) {
        super(props)
        this.bitmexClient = new Bitmex()
        this.state = {
            uiState: 'offline', // or online
            chartData: {
                bids: [], offers: [], orders: []
            },
            credentials: {},
            span: props.conf.span
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
        let root = this
        let eventListener = function (self, obj) {
            let table = obj.hasOwnProperty('table') ? obj.table : ''
            let orderBook = self.market[this.props.conf.symbol]
            if (table.startsWith('orderBookL2')) {
                let ts = (new Date()).getTime()
                if (ts > lastTs + this.props.conf.throttleMs) {
                    lastTs = ts
                    // let refBook = self.market['XBTUSD'].trim(conf.trimOrders)
                    let refBook = trimPriceRange(orderBook, this.state.span)
                    Object.assign(chartData, {'bids': refBook.bids, 'offers': refBook.offers})
                    let dataCopy = Object.assign({}, chartData)
                    this.setState({chartData: dataCopy})
                }
                if (obj.action === 'partial') {
                    root.updateOrders(orderBook, chartData, self)
                }
            } else if (table === 'order') {
                root.updateOrders(orderBook, chartData, self)
                console.log(JSON.stringify(obj))
            }
        }.bind(this)
        this.bitmexClient = new Bitmex(eventListener)
        // let ws = await this.bitmexClient.connect('VRljkeAiXH80mRndOA0TuBfY', 'sgJWLHhtOiIGXYJaeEhtLLMLFiH_aSawmI7lwLswHSsm_r1M')
        let ws = await this.bitmexClient.connect(this.state.credentials.bitmexApiKey, this.state.credentials.bitmexSecret)
        this.setState({uiState: 'online'})
        this.bitmexClient.subscribe(ws, ['orderBookL2:XBTUSD', 'trade:XBTUSD', 'order', 'position'])
    }

    updateOrders(orderBook, chartData, self) {
        let myOrders = self.tables.order
        if (orderBook && orderBook.isProper()) {
            let trimmed = trimOrders(orderBook, myOrders, this.state.span)
            Object.assign(chartData, {'orders': trimmed})
            let dataCopyOrders = Object.assign({}, chartData)
            this.setState({chartData: dataCopyOrders})
        }
    }

    render() {
        let header = null
        if (this.state.uiState === 'offline') {
            header = <LoginForm handleSubmit={this.handleSubmit}/>
        } else {
            // todo display statistics

            header = <SpanSelector initialState={{chooseSpan: 50}} callback={(inputs) => {
                console.log(JSON.stringify(inputs))
                this.setState({'span': parseInt(inputs.chooseSpan)})
            }}/>
        }

        let main = (this.state.uiState === 'online' && this.state.chartData.bids.length > 0) ? <DepthChart data={this.state.chartData} span={this.state.span}/> : null

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

function trimOrders(orderBook, myOrders, priceDelta) {
    let avg = (orderBook.bids[0].price + orderBook.offers[0].price) / 2
    return _.filter(myOrders, (o) => o.price > avg - priceDelta && o.price < avg + priceDelta && o.leavesQty && o.leavesQty > 0)
}