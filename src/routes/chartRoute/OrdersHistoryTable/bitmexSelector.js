import { get, map, flow, toUpper } from 'lodash/fp';
import { format as formatDate } from 'date-fns/fp';
import { createSelector } from 'reselect';
import { struct, mapProps } from '../../../modules/fpUtils';
import { formatMoney } from '../../../modules/i18n';

const getDate = formatDate('HH:mm:ss.SSS');
const toDate = string => new Date(string);

const getSortedTrades = createSelector(
  get(['trades']),
  flow(
    map(
      struct({
        formattedDate: flow(
          get(['timestamp']),
          toDate,
          getDate,
        ),
        formattedSide: flow(
          get(['side']),
          toUpper,
        ),
        price: flow(
          get(['price']),
          formatMoney,
        ),
        amount: get(['size']),
        trdMatchID: get(['trdMatchID']),
      }),
    ),
  ),
);

export default mapProps({
  sortedTrades: getSortedTrades,
});
