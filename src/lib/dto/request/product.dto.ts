export interface CreateProductRequestDTO {
  name: string;
  description: string;
  price: number;
  category: string;
  stock: number;
  images: string[];
  brand?: string;
  specifications?: Record<string, any>;
}

export interface UpdateProductRequestDTO {
  name?: string;
  description?: string;
  price?: number;
  category?: string;
  stock?: number;
  images?: string[];
  brand?: string;
  specifications?: Record<string, any>;
}

export interface GetProductsRequestDTO {
  page?: number;
  limit?: number;
  category?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: 'price' | 'createdAt' | 'name';
  sortOrder?: 'asc' | 'desc';
}
