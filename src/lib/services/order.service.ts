import { OrderRepository } from '../repositories/order.repository';
import { ProductRepository } from '../repositories/product.repository';
import { CartService } from './cart.service';
import { CreateOrderRequestDTO } from '../dto/request/order.dto';
import { OrderResponseDTO, OrderListResponseDTO } from '../dto/response/order.dto';
import { IOrder, IOrderItem } from '../models/Order';
import { IProduct } from '../models/Product';

export class OrderService {
  private orderRepo: OrderRepository;
  private productRepo: ProductRepository;
  private cartService: CartService;

  constructor() {
    this.orderRepo = new OrderRepository();
    this.productRepo = new ProductRepository();
    this.cartService = new CartService();
  }

  async createOrder(userId: string, data: CreateOrderRequestDTO): Promise<OrderResponseDTO> {
    // Validate all products and stock
    const orderItems: IOrderItem[] = [];
    
    for (const item of data.items) {
      const product = await this.productRepo.findById(item.productId);
      if (!product) {
        throw new Error(`Product ${item.productId} not found`);
      }

      if (product.stock < item.quantity) {
        throw new Error(`Insufficient stock for ${product.name}`);
      }

      orderItems.push({
        product: product._id,
        name: product.name,
        price: item.price,
        quantity: item.quantity,
        image: product.images[0],
      });
    }

    // Calculate totals
    const subtotal = orderItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    const tax = subtotal * 0.1; // 10% tax
    const shipping = subtotal > 100 ? 0 : 10; // Free shipping over $100
    const total = subtotal + tax + shipping;

    // Generate order number
    const orderNumber = await this.orderRepo.generateOrderNumber();

    // Create order
    const order = await this.orderRepo.create({
      orderNumber,
      user: userId as any,
      items: orderItems,
      shippingAddress: data.shippingAddress,
      paymentMethod: data.paymentMethod,
      paymentStatus: 'pending',
      orderStatus: 'pending',
      subtotal,
      tax,
      shipping,
      total,
    });

    // Update product stock
    for (const item of data.items) {
      await this.productRepo.updateStock(item.productId, item.quantity);
    }

    // Clear cart
    await this.cartService.clearCart(userId);

    return this.mapToOrderResponse(order);
  }

  async getOrderById(orderId: string): Promise<OrderResponseDTO | null> {
    const order = await this.orderRepo.findById(orderId);
    return order ? this.mapToOrderResponse(order) : null;
  }

  async getOrderByNumber(orderNumber: string): Promise<OrderResponseDTO | null> {
    const order = await this.orderRepo.findByOrderNumber(orderNumber);
    return order ? this.mapToOrderResponse(order) : null;
  }

  async getUserOrders(
    userId: string,
    page: number = 1,
    limit: number = 10
  ): Promise<OrderListResponseDTO> {
    const { orders, total } = await this.orderRepo.findByUserId(userId, page, limit);

    const totalPages = Math.ceil(total / limit);

    return {
      orders: orders.map((o) => this.mapToOrderResponse(o)),
      pagination: {
        currentPage: page,
        totalPages,
        totalOrders: total,
        limit,
      },
    };
  }

  async getAllOrders(page: number = 1, limit: number = 20): Promise<OrderListResponseDTO> {
    const { orders, total } = await this.orderRepo.findAll(page, limit);

    const totalPages = Math.ceil(total / limit);

    return {
      orders: orders.map((o) => this.mapToOrderResponse(o)),
      pagination: {
        currentPage: page,
        totalPages,
        totalOrders: total,
        limit,
      },
    };
  }

  async updateOrderStatus(
    orderId: string,
    status: IOrder['orderStatus']
  ): Promise<OrderResponseDTO | null> {
    const order = await this.orderRepo.updateStatus(orderId, status);
    return order ? this.mapToOrderResponse(order) : null;
  }

  async updatePaymentStatus(
    orderId: string,
    paymentStatus: IOrder['paymentStatus']
  ): Promise<OrderResponseDTO | null> {
    const order = await this.orderRepo.updatePaymentStatus(orderId, paymentStatus);
    return order ? this.mapToOrderResponse(order) : null;
  }

  private mapToOrderResponse(order: IOrder): OrderResponseDTO {
    return {
      id: order._id.toString(),
      orderNumber: order.orderNumber,
      userId: order.user.toString(),
      items: order.items.map((item: any) => {
        const product = item.product as IProduct;
        return {
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
          price: item.price,
          subtotal: item.price * item.quantity,
        };
      }),
      shippingAddress: order.shippingAddress,
      paymentMethod: order.paymentMethod,
      paymentStatus: order.paymentStatus,
      orderStatus: order.orderStatus,
      subtotal: order.subtotal,
      tax: order.tax,
      shipping: order.shipping,
      total: order.total,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    };
  }
}