import { flow, forEach, keyBy, map, reduce, set } from 'lodash/fp';
import {
  createOrderBook,
  deleteOrder,
  insertOrder,
  updateOrder,
} from './orderBook';

const MAX_TRADES_LENGTH = 50;

export const initialState = {
  market: {},
  tables: {
    order: {},
    position: {},
    trade: {},
  },
  trades: [],
};

export default (
  state = initialState,
  { table = '', action, data = [] } = {},
) => {
  if (table.startsWith('orderBookL2')) {
    const market = reduce(
      (market, { symbol, side, id, price, size: amount }) => {
        let orderBook = market[symbol];

        if (!orderBook) {
          orderBook = createOrderBook({ symbol });
        }

        side = side === 'Buy' ? 'bid' : 'offer';

        if (action === 'partial' || action === 'insert') {
          orderBook = insertOrder(orderBook, { side, id, price, amount });
        } else if (action === 'update') {
          orderBook = updateOrder(orderBook, { side, id, price, amount });
        } else if (action === 'delete') {
          orderBook = deleteOrder(orderBook, { side, id });
        }

        return { ...market, [symbol]: orderBook };
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

  return state;
};
