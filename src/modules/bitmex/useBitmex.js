import { useRef } from 'react';
import { useDispatch } from 'react-redux';
import connectBitmex from './connectBitmex';
import updateBitmexState from './updateBitmexState';
import { setBitmex, resetBitmex } from './duck';

const throttleMs = 100;

export default () => {
  const dispatch = useDispatch();
  const bitmexCloseRef = useRef();

  const startDataFetching = async ({ bitmexApiKey, bitmexSecret }) => {
    let bitmexState = updateBitmexState();

    let lastTs = 0;

    const onMessage = data => {
      bitmexState = updateBitmexState(bitmexState, data);

      const ts = Date.now();

      if (ts > lastTs + throttleMs) {
        lastTs = ts;

        dispatch(setBitmex(bitmexState));
      }
    };

    const onClose = () => {
      dispatch(resetBitmex());

      bitmexCloseRef.current = null;
    };

    bitmexCloseRef.current = connectBitmex({
      apiKey: bitmexApiKey,
      secret: bitmexSecret,
      onMessage,
      onClose,
    });
  };

  const stopDataFetching = () => bitmexCloseRef.current();

  return { startDataFetching, stopDataFetching };
};
