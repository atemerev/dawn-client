import { get, flow, getOr } from 'lodash/fp';
import { struct } from '../../../modules/fpUtils';

const getProps = (state, props) => props;

export default struct({
  data: get(['chartData']),
  myOrders: getOr([], ['myOrders']),
  span: flow(
    getProps,
    get(['span']),
  ),
});
