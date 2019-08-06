import { get, flow } from 'lodash/fp';
import { struct } from '../../../modules/fpUtils';
import { getFormValues, SPAN_NAME } from '../form';
import { STORE_KEY } from '../duck';
import getChartData from './getChartData';

export default struct({
  data: getChartData,
  myOrders: get([STORE_KEY, 'myOrders']),
  span: flow(
    getFormValues,
    get([SPAN_NAME]),
  ),
});
