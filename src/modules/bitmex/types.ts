export type OrderBook = {
  symbol: string;
  bids: string[];
  offers: string[];
  insertOrder: (side: string, id: string, price: number, size: number) => any;
  updateOrder: (side: string, id: string, price: number, size: number) => any;
  deleteOrder: (side: string, id: string) => any;
};

export type Market = {
  [key: string]: OrderBook;
};

export type WSPayload = {
  data?: {
    table?: string;
    action?: string;
    data?: Market[];
  };
  params?: {
    span?: number;
    symbol?: string;
  };
};

export type WSAction = {
  type?: string;
  payload?: WSPayload;
};

export type Trade = any;

export type WSState = {
  market: Market;
  tables: {
    order: any;
    position: any;
    trade: any;
  };
  trades: Trade[];
  chartData: {
    orders: string[];
    bids: string[];
    offers: string[];
  };
  myOrders: string[];
};
