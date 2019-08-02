import React from 'react';
import { Table, Button } from 'react-bootstrap';
import { fmemo } from '../../../modules/fpUtils';
import mapProps from './mapProps';

import cn from './styles.css';

export default fmemo(mapProps, ({ orders, onCancelButtonClick }) => (
  <Table striped bordered hover className={cn.root}>
    <thead>
      <tr>
        <th>Time</th>
        <th>State</th>
        <th>Side</th>
        <th>Price</th>
        <th>Amount</th>
        <th>Filled</th>
        <th>Actions</th>
      </tr>
    </thead>
    <tbody>
      {orders.map((order, index) => {
        const {
          amount,
          filled,
          formattedDate,
          formattedSide,
          formattedState,
          id,
          price,
        } = order;

        return (
          <tr key={`${id} ${index}`}>
            <td>{formattedDate}</td>
            <td>{formattedState}</td>
            <td>{formattedSide}</td>
            <td>{price}</td>
            <td>{amount}</td>
            <td>{filled}</td>
            <td>
              <Button onClick={() => onCancelButtonClick(order)}>Cancel</Button>
            </td>
          </tr>
        );
      })}
    </tbody>
  </Table>
));
