import { get } from 'lodash/fp';
import loginRoute from './loginRoute';
import chartRoute from './chartRoute';

export const matchRoute = props => {
  const uiState = get(['uiState'], props);
  const route = uiState === 'offline' ? loginRoute : chartRoute;

  return route(props);
};
