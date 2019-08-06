import { flow, forEach, keyBy, map, reduce, set, filter } from 'lodash/fp';
import shallowequal from 'shallowequal';
import { OrderBook } from '../../lib/orderbook';
import getChartData from './getChartData';

const MAX_TRADES_LENGTH = 50;

export const WS_DATA_TYPE = 'wsData';
export const ADD_MY_ORDER_TYPE = 'addMyOrderType';
export const CANCEL_MY_ORDER_TYPE = 'cancelMyOrderType';

const initialState = {
  market: {},
  tables: {
    order: {},
    position: {},
    trade: {},
  },
  trades: [],
  chartData: {
    orders: [],
    bids: [],
    offers: [],
  },
  myOrders: [],
};

const wsReducer = (
  state,
  {
    type,
    payload: {
      data: { table = '', action, data = [] } = {},
      params: { span, symbol } = {},
    } = {},
  },
) => {
  if (type !== WS_DATA_TYPE) {
    return state;
  }

  if (table.startsWith('orderBookL2')) {
    const market = reduce(
      (market, { symbol, side, id, price, size }) => {
        let book = market[symbol];

        if (!book) {
          book = new OrderBook(symbol);
        }

        side = side === 'Buy' ? 'bid' : 'offer';

        if (action === 'partial' || action === 'insert') {
          book.insertOrder(side, id, price, size);
        } else if (action === 'update') {
          book.updateOrder(side, id, price, size);
        } else if (action === 'delete') {
          book.deleteOrder(side, id);
        }

        return { ...market, [symbol]: book };
      },
      state.market,
      data,
    );

    state = { ...state, market };
  } else if (table === 'order' || table === 'position') {
    const key = table === 'order' ? 'orderID' : 'symbol';

    if (action === 'partial') {
      state = set(['tables', table], keyBy(key, data), state);
    } else if (action === 'insert' || action === 'update') {
      const {
        tables: { [table]: tableData },
      } = state;

      state = set(
        ['tables', table],
        { ...tableData, ...keyBy(key, data) },
        state,
      );
    } else if (action === 'delete') {
      let {
        tables: { [table]: tableData },
      } = state;

      tableData = { ...tableData };

      flow(
        map('orderId'),
        forEach(key => {
          delete tableData[key];
        }),
      );

      state = set(['tables', table], tableData, state);
    }
  } else if (table === 'trade') {
    if (action === 'insert' || action === 'partial') {
      let { trades = [] } = state;

      trades = [...data.reverse(), ...trades];

      if (trades.length > MAX_TRADES_LENGTH) {
        trades.length = MAX_TRADES_LENGTH;
      }

      state = { ...state, trades };
    }
  } else if (table === 'account') {
    console.log(table, action, data);
  }

  // should be moved to components as selector
  const chartData = getChartData(state, { span, symbol });

  if (!shallowequal(state.chartData, chartData)) {
    state = { ...state, chartData };
  }

  return state;
};

const myOrdersReducer = (state, { type, payload }) => {
  switch (type) {
    case ADD_MY_ORDER_TYPE: {
      state = [...state, payload];

      break;
    }
    case CANCEL_MY_ORDER_TYPE: {
      state = filter(({ id }) => id !== payload, state);

      break;
    }
  }

  return state;
};

export default (state = initialState, action = {}) => {
  state = wsReducer(state, action);

  const myOrders = myOrdersReducer(state.myOrders, action);

  if (state.myOrders !== myOrders) {
    state = { ...state, myOrders };
  }

  return state;
};
