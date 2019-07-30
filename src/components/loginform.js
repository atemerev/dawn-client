import React from 'react';

export class LoginForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      submitted: false,
      bitmexApiKey: '',
      bitmexSecret: '',
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
      <form onSubmit={this.handleSubmit} className="loginForm">
        <label>
          Bitmex API key:&nbsp;
          <input
            type="text"
            value={this.state.bitmexApiKey}
            onChange={this.handleKeyChange}
          />
        </label>
        <label>
          API secret:&nbsp;
          <input
            type="password"
            value={this.state.bitmexSecret}
            onChange={this.handleSecretChange}
          />
        </label>
        <input type="submit" value="Connect" disabled={this.state.submitted} />
      </form>
    );
  }
}
