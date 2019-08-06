import * as ReactDOM from 'react-dom';
import * as React from 'react';
import { Provider as ReduxProvider } from 'react-redux';
import App from '../components/App';
import { createStore } from './store';

const appNode = document.getElementById('app');

const store = createStore();

global.__store = store;

ReactDOM.render(
  <ReduxProvider store={store}>
    <App />
  </ReduxProvider>,
  appNode,
);
