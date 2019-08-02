import { useState, useReducer } from 'react';
import { takeRight, filter, takeWhile } from 'lodash/fp';
import { Bitmex } from '../../vendor/bitmex';
import { OrderBook } from '../../lib/orderbook';

function trimPriceRange(orderBook, priceDelta) {
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
}

function trimOrders(orderBook, myOrders, priceDelta) {
  const avg = (orderBook.bids[0].price + orderBook.offers[0].price) / 2;

  return filter(
    o =>
      o.price > avg - priceDelta &&
      o.price < avg + priceDelta &&
      o.leavesQty &&
      o.leavesQty > 0,
    myOrders,
  );
}

const MAX_TRADES_LENGTH = 50;

const reducer = (state, { table, action, data }) => {
  switch (table) {
    case 'trade': {
      if (action === 'insert' || action === 'partial') {
        let { trades } = state;

        trades = takeRight(MAX_TRADES_LENGTH, [...trades, ...data]);

        state = { ...state, trades };
      }
    }
  }

  return state;
};

const initialState = { trades: [] };

export default ({ conf }) => {
  const [bitmexClient, setBitmex] = useState(null);
  const [orderBook, setOrderBook] = useState(null);
  const [span, setSpan] = useState(conf.span);
  const [chartData, setChartData] = useState({
    bids: [],
    offers: [],
    orders: [],
  });

  const [{ trades }, dispatch] = useReducer(reducer, initialState);

  if (bitmexClient) {
    bitmexClient.span = span;
  }

  const initBitmex = async ({ credentials, conf }) => {
    let lastTs = 0;

    const eventListener = (self, obj) => {
      const updateOrders = (_orderBook, chartData) => {
        console.log('update orders');
        const myOrders = self.tables.order;

        if (_orderBook && _orderBook.isProper()) {
          const trimmed = trimOrders(_orderBook, myOrders, bitmexClient.span); // eslint-disable-line

          setChartData({
            ...chartData,
            orders: trimmed,
          });
        }
      };

      const table = obj.hasOwnProperty('table') ? obj.table : ''; // eslint-disable-line

      const _orderBook = self.market[conf.symbol];

      setOrderBook(_orderBook);

      if (table.startsWith('orderBookL2')) {
        const ts = new Date().getTime();

        if (ts > lastTs + conf.throttleMs) {
          lastTs = ts;
          // let refBook = self.market['XBTUSD'].trim(conf.trimOrders)
          const refBook = trimPriceRange(_orderBook, bitmexClient.span); // eslint-disable-line

          setChartData({
            ...chartData,
            bids: refBook.bids,
            offers: refBook.offers,
          });
        }
        if (obj.action === 'partial') {
          updateOrders(_orderBook, chartData);
        }
      } else if (table === 'order') {
        updateOrders(_orderBook, chartData);

        console.log(JSON.stringify(obj));
      } else if (obj) {
        dispatch(obj);
      }
    };

    const bitmexClient = new Bitmex(eventListener);

    const ws = await bitmexClient.connect(
      credentials.bitmexApiKey,
      credentials.bitmexSecret,
    );

    bitmexClient.subscribe(ws, [
      'orderBookL2:XBTUSD',
      'trade:XBTUSD',
      'order',
      'position',
      'account',
    ]);

    bitmexClient.span = span;

    setBitmex(bitmexClient);
  };

  const destroyBitmex = () => console.log('somehow destroy bitmex');

  return {
    chartData,
    destroyBitmex,
    initBitmex,
    orderBook,
    setSpan,
    span,
    trades,
  };
};
