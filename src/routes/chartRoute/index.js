import React, { Fragment } from 'react';
import { Row, Col } from 'react-bootstrap';
import { reduxForm } from 'redux-form';
import DepthChart from './DepthChart';
import SpanSelector from './SpanSelector';
import OrdersBar from './OrdersBar';
import OpenOrdersTable from './OpenOrdersTable';
import OrdersHistoryTable from './OrdersHistoryTable';
import InfoBar from './InfoBar';
import { FORM_NAME } from './form';
import formInitialValues from './formInitialValues';

import reducer from './duck';

import cn from './styles.css';

const Content = reduxForm({
  form: FORM_NAME,
  initialValues: formInitialValues,
})(() => (
  <Fragment>
    <InfoBar />
    <Row>
      <Col xs={4}>
        <div className="padding-y">
          <SpanSelector />
        </div>
      </Col>
    </Row>
    <Row>
      <Col xs={8}>
        <div className={cn.chart}>
          <DepthChart />
        </div>
        <div className={cn.ordersBarWrapper}>
          <OrdersBar />
        </div>
        <div>
          <OpenOrdersTable />
        </div>
      </Col>
      <Col xs={4}>
        <OrdersHistoryTable />
      </Col>
    </Row>
  </Fragment>
));

export default props => ({
  contentNode: <Content {...props} />,
});

export { reducer };
