import React, { memo } from 'react';
import Select from 'react-select';
import { Field } from 'redux-form';
import { Form } from 'react-bootstrap';
import { find } from 'lodash/fp';

import cn from './styles.css';

const options = [
  { value: 50, label: '50' },
  { value: 100, label: '100' },
  { value: 200, label: '200' },
  { value: 500, label: '500' },
  { value: 1000, label: '1000' },
];

export const INITIAL_VALUE = options[0].value;

const SelectControl = ({
  className,
  id,
  input,
  readOnly,
  selectProps = {},
}) => {
  const option = find({ value: input.value }, options);

  return (
    <Select
      {...selectProps}
      {...input}
      id={id}
      readOnly={readOnly}
      className={className}
      value={option}
      onChange={({ value }) => input.onChange(parseInt(value, 10))}
      onBlur={() => input.onBlur(option.value)}
    />
  );
};

const FieldSelectControl = props => (
  <Field {...props} component={SelectControl} />
);

export default memo(() => (
  <Form.Group controlId="formSpanSelector" className={cn.root}>
    <Form.Label className={cn.label}>Display width, USD:</Form.Label>
    <Form.Control
      name="span"
      as={FieldSelectControl}
      selectProps={{
        classNamePrefix: 'react-select',
        clearable: false,
        options,
      }}
    />
  </Form.Group>
));
