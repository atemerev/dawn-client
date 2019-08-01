import React from 'react';
import { Row, Col } from 'react-bootstrap';
import LoginForm from './LoginForm';

const Content = ({ onSubmit }) => (
  <Row>
    <Col sm={{ span: 6, offset: 3 }}>
      <LoginForm handleSubmit={onSubmit} />
    </Col>
  </Row>
);

export default ({ onLoginFormSubmit }) => ({
  contentNode: <Content onSubmit={onLoginFormSubmit} />,
});
