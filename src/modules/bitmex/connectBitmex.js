import { noop } from 'lodash/fp';
import hmacSHA256 from 'crypto-js/hmac-sha256';
import Hex from 'crypto-js/enc-hex';

const WS_ENDPOINT = 'wss://www.bitmex.com/realtime';

const channels = [
  'orderBookL2:XBTUSD',
  'trade:XBTUSD',
  'order',
  'position',
  'account',
];

const mkSignature = (nonce, secret, verb, path, body) => {
  const plain = verb + path + nonce + body;

  const hmac = hmacSHA256(plain, secret);

  return Hex.stringify(hmac);
};

const createAuthMessage = (nonce, apiKey, secret) => {
  const signature = mkSignature(nonce, secret, 'GET', '/realtime', '');

  const args = [apiKey, nonce, signature];

  return JSON.stringify({ op: 'authKey', args });
};

const createSubscribeMessage = channels => {
  return JSON.stringify({ op: 'subscribe', args: channels });
};

const createWS = ({ onClose, onMessage, onError }) =>
  new Promise(resolve => {
    const ws = new WebSocket(WS_ENDPOINT);

    ws.onopen = ev => {
      console.log(`WS connected: ${ev}`);

      resolve(ws);
    };

    ws.onerror = err => {
      console.log(`WS error: ${err}`);

      onError(err);
    };

    ws.onclose = ev => {
      console.log(`WS closed: ${ev}`);

      onClose();
    };

    ws.onmessage = msg => onMessage(JSON.parse(msg.data));
  });

export default async ({
  apiKey,
  onClose = noop,
  onError = noop,
  onMessage = noop,
  secret,
}) => {
  const ws = await createWS({
    onClose,
    onMessage,
    onError,
  });

  if (apiKey && secret) {
    const nonce = new Date().getTime();
    const authMsg = createAuthMessage(nonce, apiKey, secret);

    ws.send(authMsg);
  }

  ws.send(createSubscribeMessage(channels));

  return ws.close;
};
