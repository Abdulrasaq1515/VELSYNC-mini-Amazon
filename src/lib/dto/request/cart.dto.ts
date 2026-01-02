export interface AddToCartRequestDTO {
  productId: string;
  quantity: number;
}

export interface UpdateCartItemRequestDTO {
  quantity: number;
}
