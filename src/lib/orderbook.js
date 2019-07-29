import _ from 'lodash';

export const OrderBook = function(symbol, bids, offers) {
  this.symbol = symbol;
  this.bids = bids || [];
  this.offers = offers || [];
};

OrderBook.prototype.updateOrder = function(side, id, price, amount) {
  const line = side === 'bid' ? this.bids : this.offers;

  const idxById = _.findIndex(line, e => e.id == id, 0); // eslint-disable-line eqeqeq

  // eslint-disable-next-line eqeqeq
  if (amount == 0) {
    // amount is zero, deleting order
    this.deleteOrder(side, id);

    // eslint-disable-next-line eqeqeq
  } else if (idxById != -1) {
    // order found, updating
    const order = line[idxById];

    // eslint-disable-next-line eqeqeq
    if (price != undefined) {
      order.price = price;
    }

    // eslint-disable-next-line eqeqeq
    if (amount != undefined) {
      // eslint-disable-line eqeqeq
      order.amount = amount;
    }
  } else {
    console.log(`Error: order (update) not found. Id: ${id}, side: ${side}`);
  }
};

OrderBook.prototype.insertOrder = function(side, id, price, amount) {
  const line = side === 'bid' ? this.bids : this.offers;

  const order = { side, id, price, amount };

  const iteratee = side === 'bid' ? e => -e.price : e => e.price;

  const idx = _.sortedIndexBy(line, order, iteratee);

  line.splice(idx, 0, order);
};

OrderBook.prototype.deleteOrder = function(side, id) {
  const line = side === 'bid' ? this.bids : this.offers;

  const idxById = _.findIndex(line, e => e.id == id, 0); // eslint-disable-line eqeqeq

  // eslint-disable-next-line eqeqeq
  if (idxById != -1) {
    line.splice(idxById, 1);
  } else {
    console.log(`Error: order (delete) not found. Id: ${id}, side: ${side}`);
  }
};

OrderBook.prototype.isProper = function() {
  return this.bids.length > 0 && this.offers.length > 0;
};

OrderBook.prototype.trim = function(maxOrders) {
  return new OrderBook(
    this.symbol,
    _.take(this.bids, maxOrders),
    _.take(this.offers, maxOrders),
  );
};
