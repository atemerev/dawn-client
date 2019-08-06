import { combineReducers } from 'redux';
import { reducer as form } from 'redux-form';
import { bitmexReducer as bitmex } from '../../modules/bitmex';
import { reducer as chartPage } from '../../routes/chartRoute';

export default combineReducers({
  [bitmex.key]: bitmex,
  [chartPage.key]: chartPage,
  form,
});
