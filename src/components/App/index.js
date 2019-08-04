import React, { Fragment, useState } from 'react';
import Layout from '../Layout';
import { matchRoute } from '../../routes';
import { useBitmex } from '../../modules/bitmex';

export default () => {
  const [uiState, setUiState] = useState('offline' /* or online */);
  const { startDataFetching } = useBitmex();

  const onLoginFormSubmit = async credentials => {
    await startDataFetching(credentials);

    setUiState('online');

    console.log('Client initialized');
  };

  const layoutProps = matchRoute({
    onLoginFormSubmit,
    uiState,
  });

  return (
    <Layout
      footerNode={<Fragment>&copy; 2019 Reactivity.AI</Fragment>}
      {...layoutProps}
    />
  );
};
