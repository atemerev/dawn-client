import { flow, get, filter, takeWhile } from 'lodash/fp';
import { createSelector } from 'reselect';
import { OrderBook } from '../../lib/orderbook';

const trimOrders = (orderBook, myOrders, priceDelta) => {
  const avg = (orderBook.bids[0].price + orderBook.offers[0].price) / 2;

  return filter(
    o =>
      o.price > avg - priceDelta &&
      o.price < avg + priceDelta &&
      o.leavesQty &&
      o.leavesQty > 0,
    myOrders,
  );
};

const trimPriceRange = (orderBook, priceDelta) => {
  const avg = (orderBook.bids[0].price + orderBook.offers[0].price) / 2;
  const filteredBids = takeWhile(
    e => e.price > avg - priceDelta,
    orderBook.bids,
  );
  const filteredOffers = takeWhile(
    e => e.price < avg + priceDelta,
    orderBook.offers,
  );

  return new OrderBook(orderBook.symbol, filteredBids, filteredOffers);
};

const getProps = (state, props) => props;
const getSymbol = flow(
  getProps,
  get(['symbol']),
);

const getSpan = flow(
  getProps,
  get(['span']),
);

const getOrderBook = createSelector(
  get(['market']),
  getSymbol,
  (market, symbol) => market[symbol],
);

const getOrders = createSelector(
  getOrderBook,
  get(['tables', 'order']),
  getSpan,
  (orderBook, myOrders, span) =>
    orderBook && orderBook.isProper()
      ? trimOrders(orderBook, myOrders, span)
      : {},
);

export default (state, props) => {
  const orders = getOrders(state, props);
  const orderBook = getOrderBook(state, props);
  const span = getSpan(state, props);

  let bids = [];

  let offers = [];

  if (orderBook) {
    // can't be memoized cause orderbook is not immutable
    ({ bids, offers } = trimPriceRange(orderBook, span));
  }

  return {
    orders,
    bids,
    offers,
  };
};
