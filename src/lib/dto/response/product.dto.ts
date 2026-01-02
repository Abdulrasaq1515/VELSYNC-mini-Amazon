export interface ProductResponseDTO {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  stock: number;
  images: string[];
  brand?: string;
  specifications?: Record<string, any>;
  rating?: number;
  reviews?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductListResponseDTO {
  products: ProductResponseDTO[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalProducts: number;
    limit: number;
  };
}
