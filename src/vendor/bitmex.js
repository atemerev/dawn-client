import {OrderBook} from '../lib/orderbook'
import * as _ from "lodash";

export let Bitmex = function () {
    this.WS_ENDPOINT = 'wss://www.bitmex.com/realtime'
    this.market = {} // Map[symbol, orderbook]
}

Bitmex.prototype.connect = function (apiKey, secret) {
    let self = this
    return new Promise((resolve, reject) => {
        let ws = new WebSocket(this.WS_ENDPOINT)
        ws.onopen = function (ev) {
            console.log("WS connected: " + ev)
            resolve(ws)
        }
        ws.onerror = function (err) {
            console.log("WS error: " + err)
            reject(err)
        }
        ws.onclose = function (ev) {
            console.log("WS closed: " + ev)
        }
        ws.onmessage = function (msg) {
            let text = msg.data
            let obj = JSON.parse(text)
            let table = obj.table
            if (table.startsWith('orderBookL2')) {
                self._onMarketUpdate(obj)
            }
        }
    })
}

Bitmex.prototype._onMarketUpdate = function(obj) {
    let data = obj.data
    let action = obj.action
    _.forEach(data, (e) => {
        let symbol = e.symbol
        let book
        if (this.market.hasOwnProperty(symbol)) {
            book = this.market[symbol]
        } else {
            book = new OrderBook(symbol)
            this.market[symbol] = book
        }
        let side = e.side === 'Buy' ? 'bid' : 'offer'
        if (action === 'partial' || action === 'update') {
            book.putOrder(side, e.id, e.price, e.size)
        } else if (action === 'delete') {
            book.deleteOrder(side, e.id)
        }
    })
    let bLength = this.market['XBTUSD'].bids.length
    let oLength = this.market['XBTUSD'].offers.length
}

Bitmex.prototype.subscribe = function (ws, channels) {
    let requestObj = {"op": "subscribe", "args": channels}
    let request = JSON.stringify(requestObj)
    ws.send(request)
}