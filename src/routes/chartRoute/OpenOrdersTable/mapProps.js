import { get, map, flow } from 'lodash/fp';
import { format as formatDate } from 'date-fns/fp';
import { createSelector } from 'reselect';
import { struct, mapProps } from '../../../modules/fpUtils';

const getDate = formatDate('yyyy-MM-dd HH:mm:ss.SSS');
const toDate = string => new Date(string);

const sideMapping = {
  buy: 'BUY',
  sell: 'SELL',
};

const getOrders = createSelector(
  get(['orders']),
  map(
    struct({
      formattedDate: flow(
        get(['time']),
        toDate,
        getDate,
      ),
      formattedSide: flow(
        get(['side']),
        side => sideMapping[side],
      ),
      price: get(['price']),
      amount: get(['amount']),
      filled: () => 'n/a',
      formattedState: () => 'n/a',
    }),
  ),
);

export default mapProps({
  orders: getOrders,
});
