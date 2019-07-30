import React, { memo } from 'react';
import { useForm } from './customHooks';

const FIELD_NAME = 'chooseSpan';

export default memo(({ value, onSubmit, onChange }) => {
  const { inputs, handleInputChange } = useForm({
    initialState: { [FIELD_NAME]: value },
    onSubmit,
    onChange: value => onChange({ span: parseInt(value, 10) }),
  });

  return (
    <label>
      Display width, USD:&nbsp;
      <select
        name={FIELD_NAME}
        value={inputs.chooseSpan}
        onChange={handleInputChange}
      >
        <option key={0} value={50}>
          50
        </option>
        <option key={1} value={100}>
          100
        </option>
        <option key={2} value={200}>
          200
        </option>
        <option key={3} value={500}>
          500
        </option>
        <option key={4} value={1000}>
          1000
        </option>
      </select>
    </label>
  );
});
