import { useState } from 'react';
import * as _ from 'lodash';
import { Bitmex } from '../../vendor/bitmex';
import { OrderBook } from '../../lib/orderbook';

function trimPriceRange(orderBook, priceDelta) {
  const avg = (orderBook.bids[0].price + orderBook.offers[0].price) / 2;
  const filteredBids = _.takeWhile(
    orderBook.bids,
    e => e.price > avg - priceDelta,
  );
  const filteredOffers = _.takeWhile(
    orderBook.offers,
    e => e.price < avg + priceDelta,
  );

  return new OrderBook(orderBook.symbol, filteredBids, filteredOffers);
}

function trimOrders(orderBook, myOrders, priceDelta) {
  const avg = (orderBook.bids[0].price + orderBook.offers[0].price) / 2;

  return _.filter(
    myOrders,
    o =>
      o.price > avg - priceDelta &&
      o.price < avg + priceDelta &&
      o.leavesQty &&
      o.leavesQty > 0,
  );
}

export default ({ conf }) => {
  const [bitmexClient, setBitmex] = useState(null);
  const [span, setSpan] = useState(conf.span);
  const [chartData, setChartData] = useState({
    bids: [],
    offers: [],
    orders: [],
  });

  if (bitmexClient) {
    bitmexClient.span = span;
  }

  const initBitmex = async ({ credentials, conf }) => {
    let lastTs = 0;

    const eventListener = (self, obj) => {
      const updateOrders = (orderBook, chartData) => {
        console.log('update orders');
        const myOrders = self.tables.order;

        if (orderBook && orderBook.isProper()) {
          const trimmed = trimOrders(orderBook, myOrders, bitmexClient.span); // eslint-disable-line

          setChartData({
            ...chartData,
            orders: trimmed,
          });
        }
      };

      const table = obj.hasOwnProperty('table') ? obj.table : ''; // eslint-disable-line

      const orderBook = self.market[conf.symbol];

      if (table.startsWith('orderBookL2')) {
        const ts = new Date().getTime();

        if (ts > lastTs + conf.throttleMs) {
          lastTs = ts;
          // let refBook = self.market['XBTUSD'].trim(conf.trimOrders)
          const refBook = trimPriceRange(orderBook, bitmexClient.span); // eslint-disable-line

          setChartData({
            ...chartData,
            bids: refBook.bids,
            offers: refBook.offers,
          });
        }
        if (obj.action === 'partial') {
          updateOrders(orderBook, chartData);
        }
      } else if (table === 'order') {
        updateOrders(orderBook, chartData);

        console.log(JSON.stringify(obj));
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
    ]);

    bitmexClient.span = span;

    setBitmex(bitmexClient);
  };

  const destroyBitmex = () => console.log('somehow destroy bitmex');

  return { initBitmex, chartData, destroyBitmex, span, setSpan };
};
