import React, { memo } from 'react';
import { Row, Col } from 'react-bootstrap';
import { useBitmex } from '../../../modules/bitmex';
import bitmexSelector from './bitmexSelector';

import cn from './styles.css';

const TopCol = ({ head, body, ...props }) => (
  <Col {...props}>
    <div>{head}</div>
    <div>{body}</div>
  </Col>
);

export default memo(() => {
  const {
    state: { lastTrade, hirsch },
  } = useBitmex(bitmexSelector);

  return (
    <div className={cn.root}>
      <Row>
        <TopCol xs={1} head="Symbol" body="XBT/uSD" />
        <TopCol xs={2} head="Wallet Balance" body="10.43 BTC" />
        <TopCol xs={2} head="Exposure" body="+45470" />
        <TopCol xs={2} head="Last trade" body={lastTrade} />
        <TopCol xs={2} head="VWAP Entry" body="9568.42" />
        <TopCol xs={2} head="Hirsch" body={hirsch} />
        <TopCol xs={1} head="UP&L" body="-0.074" />
      </Row>
    </div>
  );
});
