import { take, drop } from 'lodash/fp';
import _ from 'lodash';

export const createOrderBook = ({ symbol, bids = [], offers = [] }) => {
  if (!symbol) {
    throw new Error('symbol property is required!');
  }

  return {
    symbol,
    bids,
    offers,
  };
};

export const isOrderBookProper = state => {
  if (!state) {
    return false;
  }

  const { bids, offers } = state;

  return bids.length > 0 && offers.length > 0;
};

export const trimOrderBook = ({ symbol, bids, offers }, maxOrders) =>
  createOrderBook({
    symbol,
    bids: take(maxOrders, bids),
    offers: take(maxOrders, offers),
  });

export const insertOrder = function(state, { side, id, price, amount }) {
  const key = side === 'bid' ? 'bids' : 'offers';

  const line = [...state[key]];

  const order = { side, id, price, amount };

  const iteratee = side === 'bid' ? e => -e.price : e => e.price;

  const idx = _.sortedIndexBy(line, order, iteratee);

  line.splice(idx, 0, order);

  return {
    ...state,
    [key]: line,
  };
};

export const deleteOrder = (state, { side, id }) => {
  const key = side === 'bid' ? 'bids' : 'offers';
  const line = [...state[key]];

  const idxById = _.findIndex(line, e => e.id === id, 0);

  if (idxById !== -1) {
    line.splice(idxById, 1);
  } else {
    console.log(`Error: order (delete) not found. Id: ${id}, side: ${side}`);
  }

  return {
    ...state,
    [key]: line,
  };
};

export const updateOrder = (state, { side, id, price, amount }) => {
  if (amount === 0) {
    // amount is zero, deleting order
    return deleteOrder(state, { side, id });
  }

  const key = side === 'bid' ? 'bids' : 'offers';

  const line = [...state[key]];

  const idxById = _.findIndex(line, e => e.id === id, 0);

  if (idxById !== -1) {
    // order found, updating
    let order = line[idxById];

    if (price !== undefined) {
      order = { ...order, price };
    }

    if (amount !== undefined) {
      order = { ...order, amount };
    }

    line[idxById] = order;

    return {
      ...state,
      [key]: line,
    };
  }

  console.log(`Error: order (update) not found. Id: ${id}, side: ${side}`);

  return state;
};

const hirsch = (current, max, blockSize, line) => {
  if (line.length <= current) {
    return max;
  }

  const testSize = (current + 1) * blockSize;
  const firstN = take(current + 1, line);

  if (firstN.every(e => e.amount >= testSize)) {
    const newMax = Math.max(max, current + 1);

    return hirsch(current + 1, newMax, blockSize, line);
  }
  const rest = drop(current + 1, line);

  return hirsch(0, max, blockSize, rest);
};

export const hirschOrderBookVolumes = (state, trimSize, blockSize) => {
  const trimmed = trimOrderBook(state, trimSize);

  const bidH = hirsch(0, 0, blockSize, trimmed.bids);

  const offerH = hirsch(0, 0, blockSize, trimmed.offers);

  return [[bidH], [offerH]];
};
