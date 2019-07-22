import {OrderBook} from '../lib/orderbook'
import * as _ from "lodash";
import hmacSHA256 from 'crypto-js/hmac-sha256'
import Hex from 'crypto-js/enc-hex'

export let Bitmex = function (eventListener) {
    this.WS_ENDPOINT = 'wss://www.bitmex.com/realtime'
    this.market = {} // Map[symbol, orderbook]
    this.tables = {
        'order': {},
        'position': {},
        'trade': {}
    }
    this.eventListener = eventListener
    console.log("OK")
}

Bitmex.prototype.connect = function(apiKey, secret) {
    let self = this
    return new Promise((resolve, reject) => {
        let ws = new WebSocket(this.WS_ENDPOINT)
        ws.onopen = function (ev) {
            console.log("WS connected: " + ev)
            if (apiKey && apiKey !== '') {
                self.authenticate(ws, apiKey, secret)
            }
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
            let action = obj.action
            if (obj.hasOwnProperty('table')) {
                if (table.startsWith('orderBookL2')) {
                    self._onMarketUpdate(obj)
                } else if (table === 'order' || table === 'position') {
                    let key = table === 'order' ? 'orderID' : 'symbol'
                    if (action === 'partial') {
                        self.tables[table] = _.keyBy(obj.data, key)
                    } else if (action === 'insert' || action === 'update') {
                        Object.assign(self.tables[table], _.keyBy(obj.data, key))
                    } else if (action === 'delete') {
                        obj.data.map((e) => e['orderID']).forEach(key => delete self.tables[table][key])
                    }
                }
            }
            self.eventListener(self, obj)
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
        if (action === 'partial' || action === 'insert') {
            book.insertOrder(side, e.id, e.price, e.size)
        } else if (action === 'update') {
            book.updateOrder(side, e.id, e.price, e.size)
        } else if (action === 'delete') {
            book.deleteOrder(side, e.id)
        }
    })
}

Bitmex.prototype.authenticate = function(ws, apiKey, secret) {
    let nonce = (new Date()).getTime()
    let authObj = this._mkAuthMessage(nonce, apiKey, secret)
    let authMsg = JSON.stringify(authObj)
    ws.send(authMsg)
}

Bitmex.prototype.subscribe = function (ws, channels) {
    let requestObj = {"op": "subscribe", "args": channels}
    let request = JSON.stringify(requestObj)
    ws.send(request)
}

Bitmex.prototype._mkAuthMessage = function(nonce, apiKey, secret) {
    let signature = this._mkSignature(nonce, secret, 'GET', '/realtime', '')
    let args = [apiKey, nonce, signature]
    return {"op": "authKey", "args": args}
}

Bitmex.prototype._mkSignature = function(nonce, secret, verb, path, body) {
    let plain = verb + path + nonce + body
    let hmac = hmacSHA256(plain, secret)
    return Hex.stringify(hmac)
}