import { filter } from 'lodash/fp';
import { combineReducers } from 'redux';

export const STORE_KEY = 'chartPage';
export const ADD_MY_ORDER_TYPE = 'addMyOrderType';
export const CANCEL_MY_ORDER_TYPE = 'cancelMyOrderType';

export const addMyOrder = item => ({
  type: ADD_MY_ORDER_TYPE,
  payload: item,
});

export const cancelMyOrder = id => ({
  type: CANCEL_MY_ORDER_TYPE,
  payload: id,
});

const myOrdersReducer = (state = [], { type, payload }) => {
  switch (type) {
    case ADD_MY_ORDER_TYPE: {
      state = [...state, payload];

      break;
    }
    case CANCEL_MY_ORDER_TYPE: {
      state = filter(({ id }) => id !== payload, state);

      break;
    }
  }

  return state;
};

const reducer = combineReducers({
  myOrders: myOrdersReducer,
});

reducer.key = STORE_KEY;

export default reducer;
