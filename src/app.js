import * as ReactDOM from 'react-dom';
import * as React from 'react';
import App from './components/App';

const conf = {
  throttleMs: 3000,
  span: 50,
  symbol: 'XBTUSD',
};

const domContainer = document.getElementById('app');

ReactDOM.render(<App conf={conf} />, domContainer);
