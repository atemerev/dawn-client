import React from 'react';
import LoginForm from './LoginForm';

const Header = ({ onSubmit }) => <LoginForm handleSubmit={onSubmit} />;

export default ({ onLoginFormSubmit }) => ({
  headerNode: <Header onSubmit={onLoginFormSubmit} />,
});
