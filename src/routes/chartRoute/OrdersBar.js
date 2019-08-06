import React, { memo } from 'react';
import { Row, Col, Button } from 'react-bootstrap';

export default memo(() => (
  <Row>
    <Col xs={6}>Open orders: 7</Col>
    <Col xs={6} className="text-right">
      <Button>Cancel all</Button>
    </Col>
  </Row>
));
