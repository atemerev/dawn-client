import React from 'react';
import * as _ from 'lodash';
import { Bitmex } from '../vendor/bitmex';
import { LoginForm } from './loginform';
import { DepthChart } from './vxchart';
import { OrderBook } from '../lib/orderbook';
import SpanSelector from './spanselector';

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

export class Root extends React.Component {
  constructor(props) {
    super(props);
    this.bitmexClient = new Bitmex();
    this.state = {
      uiState: 'offline', // or online
      chartData: {
        bids: [],
        offers: [],
        orders: [],
      },
      credentials: {},
      span: props.conf.span,
    };
  }

  handleSubmit = credentials => {
    this.setState({ credentials }, () => {
      this.init().then(() => console.log('Client initialized'));
    });
  };


  async init() {
    let lastTs = 0;
    const chartData = { bids: [], offers: [], orders: [] };
    const root = this;
    const eventListener = function(self, obj) {
      const table = obj.hasOwnProperty('table') ? obj.table : ''; // eslint-disable-line

      const orderBook = self.market[this.props.conf.symbol];

      if (table.startsWith('orderBookL2')) {
        const ts = new Date().getTime();

        if (ts > lastTs + this.props.conf.throttleMs) {
          lastTs = ts;
          // let refBook = self.market['XBTUSD'].trim(conf.trimOrders)
          const refBook = trimPriceRange(orderBook, this.state.span);

          Object.assign(chartData, {
            bids: refBook.bids,
            offers: refBook.offers,
          });
          const dataCopy = Object.assign({}, chartData);

          this.setState({ chartData: dataCopy });
        }
        if (obj.action === 'partial') {
          root.updateOrders(orderBook, chartData, self);
        }
      } else if (table === 'order') {
        root.updateOrders(orderBook, chartData, self);
        console.log(JSON.stringify(obj));
      }
    }.bind(this);

    this.bitmexClient = new Bitmex(eventListener);
    const ws = await this.bitmexClient.connect(
      this.state.credentials.bitmexApiKey,
      this.state.credentials.bitmexSecret,
    );

    this.setState({ uiState: 'online' });
    this.bitmexClient.subscribe(ws, [
      'orderBookL2:XBTUSD',
      'trade:XBTUSD',
      'order',
      'position',
    ]);
  }

  updateOrders(orderBook, chartData, self) {
    const myOrders = self.tables.order;

    if (orderBook && orderBook.isProper()) {
      const trimmed = trimOrders(orderBook, myOrders, this.state.span);

      Object.assign(chartData, { orders: trimmed });
      const dataCopyOrders = Object.assign({}, chartData);

      this.setState({ chartData: dataCopyOrders });
    }
  }

  render() {
    let header = null;

    if (this.state.uiState === 'offline') {
      header = <LoginForm handleSubmit={this.handleSubmit} />;
    } else {
      // todo display statistics

      header = (
        <SpanSelector
          initialState={{ chooseSpan: 50 }}
          callback={inputs => {
            console.log(JSON.stringify(inputs));
            this.setState({ span: parseInt(inputs.chooseSpan, 10) });
          }}
        />
      );
    }

    const main =
      this.state.uiState === 'online' &&
      this.state.chartData.bids.length > 0 ? (
        <DepthChart data={this.state.chartData} span={this.state.span} />
      ) : null;

    return (
      <div id="root">
        <header>
          <h1>BitMEX HF Visualizer</h1>
          {header}
        </header>
        <main id="chart">{main}</main>
        <footer>&copy; 2019 Reactivity.AI</footer>
      </div>
    );
  }
}
