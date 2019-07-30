import { useState } from 'react';

export const useForm = ({ initialState, onSubmit, onChange }) => {
  const [inputs, setInputs] = useState(initialState);

  const handleSubmit = event => {
    if (event) {
      event.preventDefault();
    }

    onSubmit(inputs);
  };

  const handleInputChange = event => {
    if (event) {
      event.persist();

      const newInputs = {
        ...inputs,
        [event.target.name]: event.target.value,
      };

      setInputs(newInputs);

      onChange(event.target.value, newInputs);
    }
  };

  return { handleSubmit, handleInputChange, inputs };
};
