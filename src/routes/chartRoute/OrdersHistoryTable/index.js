import React, { memo } from 'react';
import { Table } from 'react-bootstrap';
import { useBitmex } from '../../../modules/bitmex';
import bitmexSelector from './bitmexSelector';

import cn from './styles.css';

export default memo(() => {
  const {
    state: { sortedTrades },
  } = useBitmex(bitmexSelector);

  return (
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
  );
});
