import React, { useEffect } from 'react';
import useForm from './customhooks';

function SpanSelector(props) {
  const { inputs, handleInputChange, handleSubmit } = useForm(
    props.initialState,
    props.callback,
  );

  useEffect(() => {
    handleSubmit();
  });

  return (
    <label>
      Display width, USD:&nbsp;
      <select
        name="chooseSpan"
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
}

export default SpanSelector;
