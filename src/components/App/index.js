import React, { Fragment, useCallback, useState } from 'react';
import Layout from '../Layout';
import { matchRoute } from '../../routes';
import useBitmex from './useBitmex';

export default ({ conf }) => {
  const [uiState, setUiState] = useState('offline' /* or online */);
  const [span, setSpan] = useState(conf.span);
  const [orders, setOrders] = useState([]);
  const { initBitmex, chartData } = useBitmex({ getSpan: () => span });

  const onLoginFormSubmit = async credentials => {
    await initBitmex({ credentials, conf });

    setUiState('online');

    console.log('Client initialized');
  };

  const onSpanChange = useCallback(({ span }) => setSpan(span), []);

  const onCancellAllClick = useCallback(
    () => console.log('onCancellAllClick'),
    [],
  );

  const onOrderAdd = useCallback(order => setOrders([...orders, order]), [
    orders,
  ]);

  const onCancelButtonClick = useCallback(
    () => console.log('onCancelButtonClick'),
    [],
  );

  const layoutProps = matchRoute({
    chartData,
    conf,
    onCancelButtonClick,
    onCancellAllClick,
    onLoginFormSubmit,
    onOrderAdd,
    onSpanChange,
    orders,
    span,
    uiState,
  });

  return (
    <Layout
      footerNode={<Fragment>&copy; 2019 Reactivity.AI</Fragment>}
      {...layoutProps}
    />
  );
};
