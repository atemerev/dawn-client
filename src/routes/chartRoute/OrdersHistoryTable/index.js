import React from 'react';
import { Table } from 'react-bootstrap';
import { fmemo } from '../../../modules/fpUtils';
import mapProps from './mapProps';

import cn from './styles.css';

export default fmemo(mapProps, ({ sortedTrades }) => (
  <Table striped bordered hover className={cn.root} size="sm">
    <thead>
      <tr>
        <th>Time</th>
        <th>Side</th>
        <th>Price</th>
        <th>Amount</th>
      </tr>
    </thead>
    <tbody>
      {sortedTrades.map(
        ({ formattedDate, formattedSide, price, amount }, index) => (
          <tr key={index}>
            <td>{formattedDate}</td>
            <td>{formattedSide}</td>
            <td>{price}</td>
            <td>{amount}</td>
          </tr>
        ),
      )}
    </tbody>
  </Table>
));
