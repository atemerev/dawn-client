import * as _ from 'lodash';
import hmacSHA256 from 'crypto-js/hmac-sha256';
import Hex from 'crypto-js/enc-hex';
import { OrderBook } from '../lib/orderbook';

export const Bitmex = function(eventListener) {
  this.WS_ENDPOINT = 'wss://www.bitmex.com/realtime';
  this.market = {}; // Map[symbol, orderbook]
  this.tables = {
    order: {},
    position: {},
    trade: {},
  };
  this.eventListener = eventListener;
  console.log('OK');
};

Bitmex.prototype.connect = function(apiKey, secret) {
  const self = this;

  return new Promise((resolve, reject) => {
    const ws = new WebSocket(this.WS_ENDPOINT);

    ws.onopen = function(ev) {
      console.log(`WS connected: ${ev}`);
      if (apiKey && apiKey !== '') {
        self.authenticate(ws, apiKey, secret);
      }
      resolve(ws);
    };
    ws.onerror = function(err) {
      console.log(`WS error: ${err}`);
      reject(err);
    };
    ws.onclose = function(ev) {
      console.log(`WS closed: ${ev}`);
    };
    ws.onmessage = function(msg) {
      const text = msg.data;

      const obj = JSON.parse(text);

      const { table } = obj;

      const { action } = obj;

      // eslint-disable-next-line no-prototype-builtins
      if (obj.hasOwnProperty('table')) {
        if (table.startsWith('orderBookL2')) {
          self._onMarketUpdate(obj);
        } else if (table === 'order' || table === 'position') {
          const key = table === 'order' ? 'orderID' : 'symbol';

          if (action === 'partial') {
            self.tables[table] = _.keyBy(obj.data, key);
          } else if (action === 'insert' || action === 'update') {
            Object.assign(self.tables[table], _.keyBy(obj.data, key));
          } else if (action === 'delete') {
            obj.data
              .map(e => e.orderID)
              .forEach(key => delete self.tables[table][key]);
          }
        }
      }
      self.eventListener(self, obj);
    };
  });
};

Bitmex.prototype._onMarketUpdate = function(obj) {
  const { data } = obj;

  const { action } = obj;

  _.forEach(data, e => {
    const { symbol } = e;

    let book;

    // eslint-disable-next-line no-prototype-builtins
    if (this.market.hasOwnProperty(symbol)) {
      book = this.market[symbol];
    } else {
      book = new OrderBook(symbol);
      this.market[symbol] = book;
    }
    const side = e.side === 'Buy' ? 'bid' : 'offer';

    if (action === 'partial' || action === 'insert') {
      book.insertOrder(side, e.id, e.price, e.size);
    } else if (action === 'update') {
      book.updateOrder(side, e.id, e.price, e.size);
    } else if (action === 'delete') {
      book.deleteOrder(side, e.id);
    }
  });
};

Bitmex.prototype.authenticate = function(ws, apiKey, secret) {
  const nonce = new Date().getTime();

  const authObj = this._mkAuthMessage(nonce, apiKey, secret);

  const authMsg = JSON.stringify(authObj);

  ws.send(authMsg);
};

Bitmex.prototype.subscribe = function(ws, channels) {
  const requestObj = { op: 'subscribe', args: channels };

  const request = JSON.stringify(requestObj);

  ws.send(request);
};

Bitmex.prototype._mkAuthMessage = function(nonce, apiKey, secret) {
  const signature = this._mkSignature(nonce, secret, 'GET', '/realtime', '');

  const args = [apiKey, nonce, signature];

  return { op: 'authKey', args };
};

Bitmex.prototype._mkSignature = function(nonce, secret, verb, path, body) {
  const plain = verb + path + nonce + body;

  const hmac = hmacSHA256(plain, secret);

  return Hex.stringify(hmac);
};
