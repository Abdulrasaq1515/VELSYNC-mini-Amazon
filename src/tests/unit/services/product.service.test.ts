import { ProductService } from '../../../lib/services/product.service';
import { ProductRepository } from '../../../lib/repositories/product.repository';

jest.mock('../../../lib/repositories/product.repository');

describe('ProductService', () => {
  let productService: ProductService;
  let productRepo: jest.Mocked<ProductRepository>;

  beforeEach(() => {
    productService = new ProductService();
    productRepo = new ProductRepository() as jest.Mocked<ProductRepository>;
    (productService as any).productRepo = productRepo;
  });

  describe('createProduct', () => {
    it('should create a product successfully', async () => {
      const productData = {
        name: 'Test Product',
        description: 'Test Description',
        price: 99.99,
        category: 'Electronics',
        stock: 10,
        images: ['http://example.com/image.jpg'],
      };

      productRepo.create.mockResolvedValue({
        _id: '123',
        ...productData,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any);

      const result = await productService.createProduct(productData);

      expect(result).toHaveProperty('id');
      expect(result.name).toBe('Test Product');
      expect(result.price).toBe(99.99);
    });
  });

  describe('getProducts', () => {
    it('should return paginated products', async () => {
      const mockProducts = [
        {
          _id: '1',
          name: 'Product 1',
          price: 10,
          stock: 5,
          images: ['img1.jpg'],
        },
        {
          _id: '2',
          name: 'Product 2',
          price: 20,
          stock: 3,
          images: ['img2.jpg'],
        },
      ];

      productRepo.findAll.mockResolvedValue({
        products: mockProducts as any,
        total: 2,
      });

      const result = await productService.getProducts({ page: 1, limit: 12 });

      expect(result.products).toHaveLength(2);
      expect(result.pagination.totalProducts).toBe(2);
      expect(result.pagination.currentPage).toBe(1);
    });
  });

  describe('checkStock', () => {
    it('should return true if stock is sufficient', async () => {
      productRepo.findById.mockResolvedValue({
        _id: '123',
        stock: 10,
      } as any);

      const result = await productService.checkStock('123', 5);
      expect(result).toBe(true);
    });

    it('should return false if stock is insufficient', async () => {
      productRepo.findById.mockResolvedValue({
        _id: '123',
        stock: 3,
      } as any);

      const result = await productService.checkStock('123', 5);
      expect(result).toBe(false);
    });
  });
});
