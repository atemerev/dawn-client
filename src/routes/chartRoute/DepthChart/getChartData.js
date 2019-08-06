import { flow, get, filter, takeWhile } from 'lodash/fp';
import { createSelector, createStructuredSelector } from 'reselect';
import {
  BITMEX_STORE_KEY,
  createOrderBook,
  isOrderBookProper,
} from '../../../modules/bitmex';
import { getFormValues, SYMBOL_NAME, SPAN_NAME } from '../form';

const trimOrders = (orderBook, orders, priceDelta) => {
  const avg = (orderBook.bids[0].price + orderBook.offers[0].price) / 2;

  return filter(
    o =>
      o.price > avg - priceDelta &&
      o.price < avg + priceDelta &&
      o.leavesQty &&
      o.leavesQty > 0,
    orders,
  );
};

const trimPriceRange = (orderBook, priceDelta) => {
  const avgPrice = (orderBook.bids[0].price + orderBook.offers[0].price) / 2;

  const filteredBids = takeWhile(
    e => e.price > avgPrice - priceDelta,
    orderBook.bids,
  );

  const filteredOffers = takeWhile(
    e => e.price < avgPrice + priceDelta,
    orderBook.offers,
  );

  return createOrderBook({
    symbol: orderBook.symbol,
    bids: filteredBids,
    offers: filteredOffers,
  });
};

const getSpan = flow(
  getFormValues,
  get([SPAN_NAME]),
);

const getSymbol = flow(
  getFormValues,
  get([SYMBOL_NAME]),
);

const getOrderBook = createSelector(
  get([BITMEX_STORE_KEY, 'market']),
  getSymbol,
  (market, symbol) => market[symbol],
);

const getOrders = createSelector(
  getOrderBook,
  get([BITMEX_STORE_KEY, 'tables', 'order']),
  getSpan,
  (orderBook, orders, span) =>
    isOrderBookProper(orderBook) ? trimOrders(orderBook, orders, span) : [],
);

const getTrimmedOrderBook = createSelector(
  getOrderBook,
  getSymbol,
  getSpan,
  (orderBook, symbol, span) => {
    if (!orderBook) {
      return createOrderBook({ symbol });
    }

    return trimPriceRange(orderBook, span);
  },
);

const getBids = createSelector(
  getTrimmedOrderBook,
  get(['bids']),
);

const getOffers = createSelector(
  getTrimmedOrderBook,
  get(['offers']),
);

export default createStructuredSelector({
  orders: getOrders,
  bids: getBids,
  offers: getOffers,
});
