import { get, map, flow } from 'lodash/fp';
import { format as formatDate } from 'date-fns/fp';
import { createSelector } from 'reselect';
import { struct } from '../../../modules/fpUtils';
import { formatMoney } from '../../../modules/i18n';
import { STORE_KEY } from '../duck';

const getDate = formatDate('yyyy-MM-dd HH:mm:ss.SSS');
const toDate = string => new Date(string);

const sideMapping = {
  buy: 'BUY',
  sell: 'SELL',
};

const getMyOrders = createSelector(
  get([STORE_KEY, 'myOrders']),
  map(
    struct({
      id: get(['id']),
      formattedDate: flow(
        get(['time']),
        toDate,
        getDate,
      ),
      formattedSide: flow(
        get(['side']),
        side => sideMapping[side],
      ),
      price: flow(
        get(['price']),
        formatMoney,
      ),
      amount: get(['amount']),
      filled: () => 0,
      formattedState: () => 'NEW',
    }),
  ),
);

export default struct({
  myOrders: getMyOrders,
});
