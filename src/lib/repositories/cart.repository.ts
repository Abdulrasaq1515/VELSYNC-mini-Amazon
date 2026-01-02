import Cart, { ICart } from '../models/Cart';
import { connectDB } from '../config/database';

export class CartRepository {
  async findByUserId(userId: string): Promise<ICart | null> {
    await connectDB();
    return Cart.findOne({ user: userId }).populate('items.product');
  }

  async create(userId: string): Promise<ICart> {
    await connectDB();
    const cart = new Cart({ user: userId, items: [] });
    await cart.save();
    return cart;
  }

  async addItem(userId: string, productId: string, quantity: number): Promise<ICart | null> {
    await connectDB();
    
    let cart = await Cart.findOne({ user: userId });
    
    if (!cart) {
      cart = await this.create(userId);
    }

    const itemIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId
    );

    if (itemIndex > -1) {
      cart.items[itemIndex].quantity += quantity;
    } else {
      cart.items.push({ product: productId as any, quantity });
    }

    await cart.save();
    return cart.populate('items.product');
  }

  async updateItem(userId: string, productId: string, quantity: number): Promise<ICart | null> {
    await connectDB();
    
    const cart = await Cart.findOne({ user: userId });
    if (!cart) return null;

    const itemIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId
    );

    if (itemIndex === -1) return null;

    cart.items[itemIndex].quantity = quantity;
    await cart.save();
    return cart.populate('items.product');
  }

  async removeItem(userId: string, productId: string): Promise<ICart | null> {
    await connectDB();
    
    const cart = await Cart.findOne({ user: userId });
    if (!cart) return null;

    cart.items = cart.items.filter(
      (item) => item.product.toString() !== productId
    );

    await cart.save();
    return cart.populate('items.product');
  }

  async clearCart(userId: string): Promise<ICart | null> {
    await connectDB();
    return Cart.findOneAndUpdate(
      { user: userId },
      { items: [] },
      { new: true }
    );
  }
}