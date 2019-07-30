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

export default ({ getSpan }) => {
  const [, setBitmex] = useState(null);
  const [chartData, setChartData] = useState({
    bids: [],
    offers: [],
    orders: [],
  });

  const initBitmex = async ({ credentials, conf }) => {
    const span = getSpan();

    let lastTs = 0;

    const eventListener = (self, obj) => {
      const updateOrders = (orderBook, chartData) => {
        const myOrders = self.tables.order;

        if (orderBook && orderBook.isProper()) {
          const trimmed = trimOrders(orderBook, myOrders, span);

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
          const refBook = trimPriceRange(orderBook, span);

          Object.assign(chartData, {
            bids: refBook.bids,
            offers: refBook.offers,
          });
          const dataCopy = Object.assign({}, chartData);

          setChartData(dataCopy);
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

    setBitmex(bitmexClient);
  };

  const destroyBitmex = () => console.log('somehow destroy bitmex');

  return { initBitmex, chartData, destroyBitmex };
};
