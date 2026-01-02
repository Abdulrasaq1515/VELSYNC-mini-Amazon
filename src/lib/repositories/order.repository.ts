import Order, { IOrder } from '../models/Order';
import { connectDB } from '../config/database';

export class OrderRepository {
  async findById(id: string): Promise<IOrder | null> {
    await connectDB();
    return Order.findById(id).populate('items.product');
  }

  async findByOrderNumber(orderNumber: string): Promise<IOrder | null> {
    await connectDB();
    return Order.findOne({ orderNumber }).populate('items.product');
  }

  async findByUserId(userId: string, page: number = 1, limit: number = 10): Promise<{ orders: IOrder[]; total: number }> {
    await connectDB();
    const skip = (page - 1) * limit;
    
    const [orders, total] = await Promise.all([
      Order.find({ user: userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('items.product'),
      Order.countDocuments({ user: userId }),
    ]);

    return { orders, total };
  }

  async findAll(page: number = 1, limit: number = 20): Promise<{ orders: IOrder[]; total: number }> {
    await connectDB();
    const skip = (page - 1) * limit;
    
    const [orders, total] = await Promise.all([
      Order.find()
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('items.product'),
      Order.countDocuments(),
    ]);

    return { orders, total };
  }

  async create(orderData: Partial<IOrder>): Promise<IOrder> {
    await connectDB();
    const order = new Order(orderData);
    await order.save();
    return order.populate('items.product');
  }

  async updateStatus(id: string, status: IOrder['orderStatus']): Promise<IOrder | null> {
    await connectDB();
    return Order.findByIdAndUpdate(
      id,
      { orderStatus: status },
      { new: true }
    ).populate('items.product');
  }

  async updatePaymentStatus(id: string, paymentStatus: IOrder['paymentStatus']): Promise<IOrder | null> {
    await connectDB();
    return Order.findByIdAndUpdate(
      id,
      { paymentStatus },
      { new: true }
    ).populate('items.product');
  }

  async generateOrderNumber(): Promise<string> {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    return `ORD-${timestamp}-${random}`;
  }
}
