import { useState, useContext, useEffect } from 'react';
import { noop } from 'lodash/fp';
import shallowequal from 'shallowequal';
import { BitmexContext } from './BitmexProvider';

export default (stateSelector = noop) => {
  const bitmexClient = useContext(BitmexContext);

  const [state, setState] = useState(
    stateSelector(bitmexClient.getState(), bitmexClient.getParams()),
  );

  useEffect(() =>
    bitmexClient.addListener((bitmexState, bitmexParams) => {
      const newState = stateSelector(bitmexState, bitmexParams);

      if (!shallowequal(state, newState)) {
        setState(newState);
      }
    }),
  );

  const startDataFetching = async ({ bitmexApiKey, bitmexSecret }) => {
    const ws = await bitmexClient.connect(bitmexApiKey, bitmexSecret);

    bitmexClient.subscribe(ws, [
      'orderBookL2:XBTUSD',
      'trade:XBTUSD',
      'order',
      'position',
      'account',
    ]);
  };

  const updateParams = (...args) => bitmexClient.updateParams(...args);
  const addMyOrder = (...args) => bitmexClient.addMyOrder(...args);
  const cancelMyOrder = (...args) => bitmexClient.cancelMyOrder(...args);

  return { state, startDataFetching, updateParams, addMyOrder, cancelMyOrder };
};
