import React, { Fragment } from 'react';
import { Row, Col } from 'react-bootstrap';
import DepthChart from './DepthChart';
import SpanSelector from './SpanSelector';
import OrdersBar from './OrdersBar';
import OpenOrdersTable from './OpenOrdersTable';
import OrdersHistoryTable from './OrdersHistoryTable';
import InfoBar from './InfoBar';

import cn from './styles.css';

const Content = ({
  chartData,
  onCancelButtonClick,
  onCancellAllClick,
  onOrderAdd,
  onSpanChange,
  orders,
  span,
}) =>
  chartData.bids.length > 0 ? (
    <Fragment>
      <InfoBar />
      <Row>
        <Col xs={2}>
          <div className="padding-y">
            <SpanSelector value={span} onChange={onSpanChange} />
          </div>
        </Col>
      </Row>
      <Row>
        <Col xs={8}>
          <div className={cn.chart}>
            <DepthChart
              data={chartData}
              onOrderAdd={onOrderAdd}
              orders={orders}
              span={span}
            />
          </div>
          <div className={cn.ordersBarWrapper}>
            <OrdersBar onCancellAllClick={onCancellAllClick} />
          </div>
          <div>
            <OpenOrdersTable
              onCancelButtonClick={onCancelButtonClick}
              orders={orders}
            />
          </div>
        </Col>
        <Col xs={4}>
          <OrdersHistoryTable />
        </Col>
      </Row>
    </Fragment>
  ) : null;

export default ({
  chartData,
  onCancelButtonClick,
  onCancellAllClick,
  onOrderAdd,
  onSpanChange,
  orders,
  span,
}) => ({
  contentNode: (
    <Content
      chartData={chartData}
      onCancelButtonClick={onCancelButtonClick}
      onCancellAllClick={onCancellAllClick}
      onSpanChange={onSpanChange}
      onOrderAdd={onOrderAdd}
      orders={orders}
      span={span}
    />
  ),
});
