import { ProductResponseDTO } from './product.dto';
export interface CartItemResponseDTO {
  id: string;
  product: ProductResponseDTO;
  quantity: number;
  subtotal: number;
}

export interface CartResponseDTO {
  id: string;
  userId: string;
  items: CartItemResponseDTO[];
  total: number;
  itemCount: number;
}