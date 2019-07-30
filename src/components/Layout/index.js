import React from 'react';
import cn from './styles.css';

export default ({ headerNode, contentNode, footerNode }) => (
  <div className={cn.root}>
    <header>
      <h1>BitMEX HF Visualizer</h1>
      {headerNode}
    </header>
    <main>{contentNode}</main>
    <footer>{footerNode}</footer>
  </div>
);
