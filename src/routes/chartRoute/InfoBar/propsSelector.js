import { get, flow, head } from 'lodash/fp';
import { createSelector } from 'reselect';
import { struct } from '../../../modules/fpUtils';
import { formatMoney } from '../../../modules/i18n';
import {
  BITMEX_STORE_KEY,
  hirschOrderBookVolumes,
} from '../../../modules/bitmex';
import { getFormValues, SYMBOL_NAME } from '../form';

const getLastTrade = createSelector(
  get([BITMEX_STORE_KEY, 'trades']),
  trades => {
    const price = flow(
      head,
      get(['price']),
    )(trades);

    return price ? formatMoney(price) : '-';
  },
);

const getSymbol = flow(
  getFormValues,
  get([SYMBOL_NAME]),
);

const getOrderBook = createSelector(
  get([BITMEX_STORE_KEY, 'market']),
  getSymbol,
  (market, symbol) => market[symbol],
);

const getHirsch = flow(
  getOrderBook,
  orderBook => {
    if (!orderBook) {
      return '';
    }

    return flow(
      orderBook => hirschOrderBookVolumes(orderBook, 25, 50000),
      ([hirschBid, hirshOffer]) => `${hirschBid}/${hirshOffer}`,
    )(orderBook);
  },
);

export default struct({
  hirsch: getHirsch,
  lastTrade: getLastTrade,
});
