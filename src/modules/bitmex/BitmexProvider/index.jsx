import React, { createContext } from 'react';

export const BitmexContext = createContext(null);

export default ({ children, client }) => (
  <BitmexContext.Provider value={client}>{children}</BitmexContext.Provider>
);
