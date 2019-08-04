import React, { Component } from 'react';
import { Form, Button } from 'react-bootstrap';

export default class LoginForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      submitted: false,
      bitmexApiKey: 'P3skizzyDTWyiQMzGldEYYbm',
      bitmexSecret: 'FYso9EMhJVG4vC6OPv_LT0pMP4bWp63YZ2UOwZzsgh02mgYX',
    };
  }

  handleKeyChange = event => {
    this.setState({ bitmexApiKey: event.target.value });
  };

  handleSecretChange = event => {
    this.setState({ bitmexSecret: event.target.value });
  };

  handleSubmit = event => {
    event.preventDefault();
    this.setState({ submitted: true });
    console.log(JSON.stringify(this.state));
    this.props.handleSubmit(this.state);
  };

  render() {
    return (
      <Form onSubmit={this.handleSubmit}>
        <Form.Group controlId="formApiKey">
          <Form.Label>Bitmex API key:</Form.Label>
          <Form.Control
            placeholder="Bitmex API key"
            type="text"
            value={this.state.bitmexApiKey}
            onChange={this.handleKeyChange}
          />
        </Form.Group>

        <Form.Group controlId="formApiSecret">
          <Form.Label>API secret:</Form.Label>
          <Form.Control
            type="password"
            placeholder="API secret"
            value={this.state.bitmexSecret}
            onChange={this.handleSecretChange}
          />
        </Form.Group>
        <div className="text-right">
          <Button
            variant="primary"
            type="submit"
            disabled={this.state.submitted}
          >
            Connect
          </Button>
        </div>
      </Form>
    );
  }
}
