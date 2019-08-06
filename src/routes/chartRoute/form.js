import { createSelector } from 'reselect';
import { getFormValues as rfGetFormValues } from 'redux-form';

export const FORM_NAME = 'chartPage';
export const SPAN_NAME = 'span';
export const SYMBOL_NAME = 'symbol';

export const getFormValues = createSelector(
  rfGetFormValues(FORM_NAME),
  (values = {}) => values,
);
