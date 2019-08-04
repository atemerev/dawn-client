import * as ReactDOM from 'react-dom';
import * as React from 'react';
import { Bitmex, BitmexProvider } from './modules/bitmex';
import App from './components/App';

const domContainer = document.getElementById('app');

const bitmexClient = new Bitmex({
  throttleMs: 100,
  span: 50,
  symbol: 'XBTUSD',
});

ReactDOM.render(
  <BitmexProvider client={bitmexClient}>
    <App />
  </BitmexProvider>,
  domContainer,
);
