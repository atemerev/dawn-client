import { get, flow } from 'lodash/fp';
import { struct } from '../../../modules/fpUtils';

const getProps = (state, props) => props;

export default struct({
  span: flow(
    getProps,
    get(['span']),
  ),
});
