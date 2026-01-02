import { ProductRepository } from '../repositories/product.repository';
import {
  CreateProductRequestDTO,
  UpdateProductRequestDTO,
  GetProductsRequestDTO,
} from '../dto/request/product.dto';
import {
  ProductResponseDTO,
  ProductListResponseDTO,
} from '../dto/response/product.dto';
import { IProduct } from '../models/Product';

export class ProductService {
  private productRepo: ProductRepository;

  constructor() {
    this.productRepo = new ProductRepository();
  }

  async getProducts(params: GetProductsRequestDTO): Promise<ProductListResponseDTO> {
    const { products, total } = await this.productRepo.findAll(params);

    const totalPages = Math.ceil(total / (params.limit || 12));

    return {
      products: products.map((p) => this.mapToProductResponse(p)),
      pagination: {
        currentPage: params.page || 1,
        totalPages,
        totalProducts: total,
        limit: params.limit || 12,
      },
    };
  }

  async getProductById(id: string): Promise<ProductResponseDTO | null> {
    const product = await this.productRepo.findById(id);
    return product ? this.mapToProductResponse(product) : null;
  }

  async createProduct(data: CreateProductRequestDTO): Promise<ProductResponseDTO> {
    const product = await this.productRepo.create(data);
    return this.mapToProductResponse(product);
  }

  async updateProduct(
    id: string,
    data: UpdateProductRequestDTO
  ): Promise<ProductResponseDTO | null> {
    const product = await this.productRepo.update(id, data);
    return product ? this.mapToProductResponse(product) : null;
  }

  async deleteProduct(id: string): Promise<boolean> {
    return this.productRepo.delete(id);
  }

  async getCategories(): Promise<string[]> {
    return this.productRepo.getCategories();
  }

  async checkStock(productId: string, quantity: number): Promise<boolean> {
    const product = await this.productRepo.findById(productId);
    return product ? product.stock >= quantity : false;
  }

  private mapToProductResponse(product: IProduct): ProductResponseDTO {
    return {
      id: product._id.toString(),
      name: product.name,
      description: product.description,
      price: product.price,
      category: product.category,
      stock: product.stock,
      images: product.images,
      brand: product.brand,
      specifications: product.specifications,
      rating: product.rating,
      reviews: product.reviews,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    };
  }
}
