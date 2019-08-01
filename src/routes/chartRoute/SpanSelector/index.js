import React, { memo } from 'react';
import Select from 'react-select';
import { find } from 'lodash/fp';

import cn from './styles.css';

const options = [
  { value: 50, label: '50' },
  { value: 100, label: '100' },
  { value: 200, label: '200' },
  { value: 500, label: '500' },
  { value: 1000, label: '1000' },
];

export default memo(({ value, onChange }) => (
  <div className={cn.root}>
    <Select
      classNamePrefix="react-select"
      clearable={false}
      value={find({ value }, options)}
      onChange={({ value }) => onChange(parseInt(value, 10))}
      options={options}
    />
  </div>
));
