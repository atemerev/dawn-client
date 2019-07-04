import _ from 'lodash'

export let OrderBook = function(symbol, bids, offers) {
    this.symbol = symbol
    this.bids = bids ? bids : []
    this.offers = offers ? offers : []
}

/**
 * Put order to order book. If order with the same ID exists, it gets replaced, otherwise it
 * is inserted in according to side and price.
 *
 * @param side Order side, 'bid' or 'offer'
 * @param id Order ID
 * @param price Order price
 * @param amount Order amount
 */
OrderBook.prototype.putOrder = function(side, id, price, amount) {
    this.deleteOrder(side, id)
    let line = side === 'bid' ? this.bids : this.offers
    let order = {'side': side, 'id': id, 'price': price, 'amount': amount}
    let idx = _.sortedIndexBy(line, order, (e) => e.price)
    if (line == this.bids) {
        idx = line.length - idx
    }
    line.splice(idx, 0, order)
}

/**
 * Delete order (by id) from order book. If order ID not found by side, does nothing
 *
 * @param side Order side, 'bid' or 'offer'
 * @param id Order id to remove.
 */
OrderBook.prototype.deleteOrder = function(side, id) {
    let line = side === 'bid' ? this.bids : this.offers
    let idxById = _.findIndex(line, (e) => e.id == id, 0)
    if (idxById != -1) {
        line.splice(idxById, 1)
    }
}

OrderBook.prototype.trim = function(maxOrders) {
    return new OrderBook(this.symbol, _.take(this.bids, maxOrders), _.take(this.offers, maxOrders))
}