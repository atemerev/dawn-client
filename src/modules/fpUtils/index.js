import { createStructuredSelector, defaultMemoize } from 'reselect';

export const struct = createStructuredSelector;

export const mapProps = getters =>
  defaultMemoize(props => {
    const newProps = struct(getters)(props);

    console.log('mmmm')

    return {
      ...props,
      ...newProps,
    };
  });