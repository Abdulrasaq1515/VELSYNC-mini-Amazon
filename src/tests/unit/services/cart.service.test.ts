import { CartService } from '../../../lib/services/cart.service';
import { CartRepository } from '../../../lib/repositories/cart.repository';
import { ProductRepository } from '../../../lib/repositories/product.repository';

jest.mock('../../../lib/repositories/cart.repository');
jest.mock('../../../lib/repositories/product.repository');

describe('CartService', () => {
  let cartService: CartService;
  let cartRepo: jest.Mocked<CartRepository>;
  let productRepo: jest.Mocked<ProductRepository>;

  beforeEach(() => {
    cartService = new CartService();
    cartRepo = new CartRepository() as jest.Mocked<CartRepository>;
    productRepo = new ProductRepository() as jest.Mocked<ProductRepository>;
    (cartService as any).cartRepo = cartRepo;
    (cartService as any).productRepo = productRepo;
  });

  describe('addToCart', () => {
    it('should add item to cart successfully', async () => {
      const userId = 'user123';
      const addToCartData = {
        productId: 'prod123',
        quantity: 2,
      };

      productRepo.findById.mockResolvedValue({
        _id: 'prod123',
        name: 'Test Product',
        price: 50,
        stock: 10,
        images: ['img.jpg'],
      } as any);

      cartRepo.addItem.mockResolvedValue({
        _id: 'cart123',
        user: userId,
        items: [
          {
            product: {
              _id: 'prod123',
              name: 'Test Product',
              price: 50,
            },
            quantity: 2,
          },
        ],
      } as any);

      const result = await cartService.addToCart(userId, addToCartData);

      expect(result).toHaveProperty('items');
      expect(result.items[0].quantity).toBe(2);
    });

    it('should throw error if product not found', async () => {
      productRepo.findById.mockResolvedValue(null);

      await expect(
        cartService.addToCart('user123', { productId: 'invalid', quantity: 1 })
      ).rejects.toThrow('Product not found');
    });

    it('should throw error if insufficient stock', async () => {
      productRepo.findById.mockResolvedValue({
        _id: 'prod123',
        stock: 1,
      } as any);

      await expect(
        cartService.addToCart('user123', { productId: 'prod123', quantity: 5 })
      ).rejects.toThrow('Insufficient stock');
    });
  });
});

