export interface Product {
  id: number;
  name: string;
  price: number;
  category: string;
  stock: number;
}

export interface OrderRequest {
  productId: number;
  quantity: number;
  customerName: string;
}

export interface OrderResponse {
  orderId: string;
  status: 'CONFIRMED';
  product: {
    id: number;
    name: string;
    price: number;
    category: string;
  };
  quantity: number;
  customerName: string;
  totalAmount: number;
}

export interface ErrorResponse {
  error: string;
  message: string;
}

export type MockScenario =
  | 'success'
  | 'payment_failure'
  | 'server_error'
  | 'unavailable'
  | 'timeout';
