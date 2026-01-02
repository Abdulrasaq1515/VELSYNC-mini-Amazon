import { CartRepository } from '../repositories/cart.repository';
import { ProductRepository } from '../repositories/product.repository';
import { AddToCartRequestDTO, UpdateCartItemRequestDTO } from '../dto/request/cart.dto';
import { CartResponseDTO, CartItemResponseDTO } from '../dto/response/cart.dto';
import { ICart } from '../models/Cart';
import { IProduct } from '../models/Product';

export class CartService {
  private cartRepo: CartRepository;
  private productRepo: ProductRepository;

  constructor() {
    this.cartRepo = new CartRepository();
    this.productRepo = new ProductRepository();
  }

  async getCart(userId: string): Promise<CartResponseDTO | null> {
    let cart = await this.cartRepo.findByUserId(userId);
    
    if (!cart) {
      cart = await this.cartRepo.create(userId);
    }

    return this.mapToCartResponse(cart);
  }

  async addToCart(userId: string, data: AddToCartRequestDTO): Promise<CartResponseDTO> {
    console.log('🛒 Adding to cart:', { userId, productId: data.productId, quantity: data.quantity });
    
    // Verify product exists and has stock
    const product = await this.productRepo.findById(data.productId);
    console.log('📦 Product found:', product ? product.name : 'NOT FOUND');
    
    if (!product) {
      throw new Error(`Product not found: ${data.productId}`);
    }

    if (product.stock < data.quantity) {
      throw new Error('Insufficient stock');
    }

    const cart = await this.cartRepo.addItem(userId, data.productId, data.quantity);
    if (!cart) {
      throw new Error('Failed to add item to cart');
    }

    console.log('✅ Cart updated, items:', cart.items.length);
    return this.mapToCartResponse(cart);
  }

  async updateCartItem(
    userId: string,
    productId: string,
    data: UpdateCartItemRequestDTO
  ): Promise<CartResponseDTO> {
    // Verify product has stock
    const product = await this.productRepo.findById(productId);
    if (!product) {
      throw new Error('Product not found');
    }

    if (product.stock < data.quantity) {
      throw new Error('Insufficient stock');
    }

    const cart = await this.cartRepo.updateItem(userId, productId, data.quantity);
    if (!cart) {
      throw new Error('Failed to update cart item');
    }

    return this.mapToCartResponse(cart);
  }

  async removeFromCart(userId: string, productId: string): Promise<CartResponseDTO> {
    const cart = await this.cartRepo.removeItem(userId, productId);
    if (!cart) {
      throw new Error('Failed to remove item from cart');
    }

    return this.mapToCartResponse(cart);
  }

  async clearCart(userId: string): Promise<void> {
    await this.cartRepo.clearCart(userId);
  }

  private mapToCartResponse(cart: ICart): CartResponseDTO {
    const items: CartItemResponseDTO[] = cart.items
      .map((item: any) => {
        const product = item.product as IProduct;
        
        // Skip items where product no longer exists
        if (!product || !product._id) {
          console.warn('Product not found for cart item:', item);
          return null;
        }
        
        return {
          id: item._id.toString(),
          product: {
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
          },
          quantity: item.quantity,
          subtotal: product.price * item.quantity,
        };
      })
      .filter((item): item is CartItemResponseDTO => item !== null);

    const total = items.reduce((sum, item) => sum + item.subtotal, 0);

    return {
      id: cart._id.toString(),
      userId: cart.user.toString(),
      items,
      total,
      itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
    };
  }
}