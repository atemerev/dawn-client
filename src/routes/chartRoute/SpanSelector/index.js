import React, { memo } from 'react';
import Select from 'react-select';
import { Form } from 'react-bootstrap';
import { find } from 'lodash/fp';
import { useBitmex } from '../../../modules/bitmex';
import bitmexSelector from './bitmexSelector';

import cn from './styles.css';

const options = [
  { value: 50, label: '50' },
  { value: 100, label: '100' },
  { value: 200, label: '200' },
  { value: 500, label: '500' },
  { value: 1000, label: '1000' },
];

export default memo(() => {
  const {
    state: { span: value },
    updateParams,
  } = useBitmex(bitmexSelector);

  return (
    <Form.Group controlId="formSpanSelector" className={cn.root}>
      <Form.Label className={cn.label}>Display width, USD:</Form.Label>
      <Form.Control
        as={Select}
        classNamePrefix="react-select"
        clearable={false}
        value={find({ value }, options)}
        onChange={({ value }) => updateParams({ span: parseInt(value, 10) })}
        options={options}
      />
    </Form.Group>
  );
});
