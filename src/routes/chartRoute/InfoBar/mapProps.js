import { get, flow, last } from 'lodash/fp';
import { createSelector } from 'reselect';
import { mapProps } from '../../../modules/fpUtils';
import { formatMoney } from '../../../modules/i18n';
import { hirschVolumes } from '../../../lib/analysis';

const getLastTrade = createSelector(
  get(['trades']),
  flow(
    last,
    get(['price']),
    formatMoney,
  ),
);

const getHirsch = createSelector(
  get(['orderBook']),
  flow(
    orderBook => hirschVolumes(orderBook, 25, 50000),
    ([arr1, arr2]) => {
      const left = Math.max(...arr1);
      const right = Math.max(...arr2);

      return `${left}/${right}`;
    },
  ),
);

export default mapProps({
  hirsch: getHirsch,
  lastTrade: getLastTrade,
});
