import { get, flow, head } from 'lodash/fp';
import { createSelector } from 'reselect';
import { struct } from '../../../modules/fpUtils';
import { formatMoney } from '../../../modules/i18n';
import { hirschVolumes } from '../../../lib/analysis';

const getLastTrade = createSelector(
  get(['trades']),
  trades => {
    const price = flow(
      head,
      get(['price']),
    )(trades);

    return price ? formatMoney(price) : '-';
  },
);

const getProps = (state, props) => props;

const getSymbol = flow(
  getProps,
  get(['symbol']),
);

const getOrderBook = createSelector(
  get(['market']),
  getSymbol,
  (market, symbol) => market[symbol],
);

const getHirsch = flow(
  getOrderBook,
  // get(['chartData']),
  orderBook => {
    if (!orderBook) {
      return '';
    }

    return flow(
      orderBook => hirschVolumes(orderBook, 25, 50000),
      ([hirschBid, hirshOffer]) => `${hirschBid}/${hirshOffer}`,
    )(orderBook);
  },
);

export default struct({
  hirsch: getHirsch,
  lastTrade: getLastTrade,
});
