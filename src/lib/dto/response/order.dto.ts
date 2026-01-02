import { ProductResponseDTO } from './product.dto';

export interface OrderResponseDTO {
  id: string;
  orderNumber: string;
  userId: string;
  items: Array<{
    product: ProductResponseDTO;
    quantity: number;
    price: number;
    subtotal: number;
  }>;
  shippingAddress: {
    fullName: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    phone: string;
  };
  paymentMethod: string;
  paymentStatus: 'pending' | 'paid' | 'failed';
  orderStatus: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderListResponseDTO {
  orders: OrderResponseDTO[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalOrders: number;
    limit: number;
  };
}