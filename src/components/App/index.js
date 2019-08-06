import React, { Fragment, useState, useEffect } from 'react';
import Layout from '../Layout';
import { matchRoute } from '../../routes';
import { useBitmex } from '../../modules/bitmex';

export default () => {
  const [uiState, setUiState] = useState('offline' /* or online */);
  const { startDataFetching, stopDataFetching } = useBitmex();

  useEffect(() => () => stopDataFetching(), []); // componentWillUnmount

  const onLoginFormSubmit = async credentials => {
    await startDataFetching(credentials);

    setUiState('online');

    console.log('Client initialized');
  };

  const onLogout = async credentials => {
    await stopDataFetching(credentials);

    setUiState('offline');
  };

  const layoutProps = matchRoute({
    onLoginFormSubmit,
    onLogout,
    uiState,
  });

  return (
    <Layout
      footerNode={<Fragment>&copy; 2019 Reactivity.AI</Fragment>}
      {...layoutProps}
    />
  );
};
