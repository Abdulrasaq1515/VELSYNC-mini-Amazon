export interface CreateOrderRequestDTO {
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
  paymentMethod: 'stripe';
  items: Array<{
    productId: string;
    quantity: number;
    price: number;
  }>;
}