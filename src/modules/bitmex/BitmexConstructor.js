import { forEach, noop } from 'lodash/fp';
import hmacSHA256 from 'crypto-js/hmac-sha256';
import Hex from 'crypto-js/enc-hex';
import updateImmutableState, {
  ADD_MY_ORDER_TYPE,
  CANCEL_MY_ORDER_TYPE,
  WS_DATA_TYPE,
} from './updateImmutableState';

const Bitmex = function(params) {
  this.WS_ENDPOINT = 'wss://www.bitmex.com/realtime';
  this.nextListenerIndex = 1;
  this.listeners = {};
  this._params = params;

  this.lastTs = 0;

  this._immutableState = updateImmutableState();

  console.log('OK');
};

Bitmex.prototype.connect = function(apiKey, secret) {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(this.WS_ENDPOINT);

    ws.onopen = ev => {
      console.log(`WS connected: ${ev}`);
      if (apiKey && apiKey !== '') {
        this.authenticate(ws, apiKey, secret);
      }
      resolve(ws);
    };
    ws.onerror = err => {
      console.log(`WS error: ${err}`);
      reject(err);
    };
    ws.onclose = ev => {
      console.log(`WS closed: ${ev}`);
    };
    ws.onmessage = msg => {
      this._immutableState = updateImmutableState(this._immutableState, {
        type: WS_DATA_TYPE,
        payload: {
          data: JSON.parse(msg.data),
          params: this._params,
        },
      });

      const ts = Date.now();

      if (ts > this.lastTs + this._params.throttleMs) {
        this.lastTs = ts;

        this.triggerListeners();
      }
    };
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

Bitmex.prototype.addListener = function(fn) {
  const index = this.nextListenerIndex;

  this.nextListenerIndex += 1;

  this.listeners[index] = fn;

  return () => {
    delete this.listeners[index];
  };
};

Bitmex.prototype.triggerListeners = function() {
  forEach(
    (listener = noop) => listener(this._immutableState, this._params),
    this.listeners,
  );
};

Bitmex.prototype.updateParams = function(params) {
  this._params = { ...this._params, ...params };
};

Bitmex.prototype.getParams = function() {
  return this._params;
};

Bitmex.prototype.getState = function() {
  return this._immutableState;
};

Bitmex.prototype.addMyOrder = function(item) {
  this._immutableState = updateImmutableState(this._immutableState, {
    type: ADD_MY_ORDER_TYPE,
    payload: item,
  });
};

Bitmex.prototype.cancelMyOrder = function(id) {
  this._immutableState = updateImmutableState(this._immutableState, {
    type: CANCEL_MY_ORDER_TYPE,
    payload: id,
  });
};

export default Bitmex;
