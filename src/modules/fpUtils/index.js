import { createStructuredSelector, defaultMemoize } from 'reselect';
import { flow } from 'lodash/fp';
import { memo } from 'react';

export const struct = createStructuredSelector;

export const mapProps = getters =>
  defaultMemoize(props => {
    const newProps = struct(getters)(props);

    return {
      ...props,
      ...newProps,
    };
  });

export const fmemo = (...fns) => memo(flow(...fns));
