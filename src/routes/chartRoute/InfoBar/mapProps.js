import { get, flow, last } from 'lodash/fp';
import { createSelector } from 'reselect';
import { mapProps } from '../../../modules/fpUtils';
import { formatMoney } from '../../../modules/i18n';

const getLastTrade = createSelector(
  get(['trades']),
  flow(
    last,
    get(['price']),
    formatMoney,
  ),
);

export default mapProps({
  lastTrade: getLastTrade,
});
