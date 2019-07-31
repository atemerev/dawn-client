import React, { memo } from 'react';
import { Row, Col } from 'react-bootstrap';
import cn from './styles.css';

const TopCol = ({ head, body, ...props }) => (
  <Col {...props}>
    <div>{head}</div>
    <div>{body}</div>
  </Col>
);

export default memo(() => (
  <div className={cn.root}>
    <Row>
      <TopCol xs={1} head="Symbol" body="XBT/uSD" />
      <TopCol xs={2} head="Wallet Balance" body="10.43 BTC" />
      <TopCol xs={2} head="Exposure" body="+45470" />
      <TopCol xs={2} head="Last trade" body="9564.0" />
      <TopCol xs={2} head="VWAP Entry" body="9568.42" />
      <TopCol xs={2} head="Price action" body="+4.42" />
      <TopCol xs={1} head="UP&L" body="-0.074" />
    </Row>
  </div>
));
