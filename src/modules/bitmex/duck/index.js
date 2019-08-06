import { initialState } from '../updateBitmexState';

export const STORE_KEY = 'bitmex';

const BITMEX_SET = 'BITMEX/SET';
const BITMEX_RESET = 'BITMEX/RESET';

export const setBitmex = payload => ({
  type: BITMEX_SET,
  payload,
});

export const resetBitmex = () => ({
  type: BITMEX_RESET,
});

const reducer = (state = initialState, { type, payload } = {}) => {
  switch (type) {
    case BITMEX_SET:
      return payload;

    case BITMEX_RESET:
      return initialState;
  }

  return state;
};

reducer.key = STORE_KEY;

export default reducer;
