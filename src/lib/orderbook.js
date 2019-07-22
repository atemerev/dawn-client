import _ from 'lodash'

export let OrderBook = function (symbol, bids, offers) {
    this.symbol = symbol
    this.bids = bids ? bids : []
    this.offers = offers ? offers : []
}

OrderBook.prototype.updateOrder = function(side, id, price, amount) {
    let line = side === 'bid' ? this.bids : this.offers
    let idxById = _.findIndex(line, (e) => e.id == id, 0)
    if (amount == 0) {
        // amount is zero, deleting order
        this.deleteOrder(side, id)
    } else if (idxById != -1) {
        // order found, updating
        let order = line[idxById]
        if (price != undefined) {
            order.price = price
        }
        if (amount != undefined) {
            order.amount = amount
        }
    } else {
        console.log('Error: order (update) not found. Id: ' + id + ', side: ' + side)
    }
}


OrderBook.prototype.insertOrder = function(side, id, price, amount) {
    let line = side === 'bid' ? this.bids : this.offers
    let order = {'side': side, 'id': id, 'price': price, 'amount': amount}
    let iteratee = side === 'bid' ? (e) => -e.price : (e) => e.price
    let idx = _.sortedIndexBy(line, order, iteratee)
    line.splice(idx, 0, order)
}

OrderBook.prototype.deleteOrder = function(side, id) {
    let line = side === 'bid' ? this.bids : this.offers
    let idxById = _.findIndex(line, (e) => e.id == id, 0)
    if (idxById != -1) {
        line.splice(idxById, 1)
    } else {
        console.log('Error: order (delete) not found. Id: ' + id + ', side: ' + side)
    }
}

OrderBook.prototype.isProper = function() {
    return this.bids.length > 0 && this.offers.length > 0
}

OrderBook.prototype.trim = function (maxOrders) {
    return new OrderBook(this.symbol, _.take(this.bids, maxOrders), _.take(this.offers, maxOrders))
}