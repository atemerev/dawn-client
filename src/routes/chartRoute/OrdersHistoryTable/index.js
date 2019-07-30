import React, { memo } from 'react';
import { Table } from 'react-bootstrap';

import cn from './styles.css';

export default memo(() => (
  <Table striped bordered hover className={cn.root}>
    <thead>
      <tr>
        <th>Time</th>
        <th>Side</th>
        <th>Price</th>
        <th>Amount</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>01:03:05.472</td>
        <td>BUY</td>
        <td>9563.5</td>
        <td>500</td>
      </tr>
    </tbody>
  </Table>
));
