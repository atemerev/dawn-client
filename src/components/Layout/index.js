import React from 'react';
import { Container } from 'react-bootstrap';
import cn from './styles.css';

export default ({ headerNode, contentNode, footerNode }) => (
  <Container className={cn.root} fluid>
    <div className={cn.wrapper}>
      <header className={cn.header}>
        <h1>BitMEX HF Visualizer</h1>
        {headerNode}
      </header>
      <main>{contentNode}</main>
    </div>
    <footer className={cn.footer}>{footerNode}</footer>
  </Container>
);
