import request from 'supertest';
import { app } from '../../app';
import User from '../../lib/models/User';
import Product from '../../lib/models/Product';
import Order from '../../lib/models/Order';

describe('Checkout Flow Integration Tests', () => {
  let authToken: string;
  let userId: string;
  let productId: string;

  beforeEach(async () => {
    // Create user
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash('password123', 12);
    const user = await User.create({
      name: 'Test User',
      email: 'test@example.com',
      password: hashedPassword,
    });
    userId = user._id.toString();

    // Login to get token
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: 'password123',
      });
    authToken = loginResponse.body.data.token;

    // Create product
    const product = await Product.create({
      name: 'Test Product',
      description: 'Test Description',
      price: 100,
      category: 'Electronics',
      stock: 10,
      images: ['img.jpg'],
    });
    productId = product._id.toString();
  });

  it('should complete full checkout flow', async () => {
    // Add to cart
    const cartResponse = await request(app)
      .post('/api/cart')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        productId,
        quantity: 2,
      });

    expect(cartResponse.status).toBe(200);

    // Create order
    const orderResponse = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        shippingAddress: {
          fullName: 'Test User',
          addressLine1: '123 Test St',
          city: 'Test City',
          state: 'TS',
          postalCode: '12345',
          country: 'US',
          phone: '1234567890',
        },
        paymentMethod: 'stripe',
        items: [
          {
            productId,
            quantity: 2,
            price: 100,
          },
        ],
      });

    expect(orderResponse.status).toBe(201);
    expect(orderResponse.body.success).toBe(true);
    expect(orderResponse.body.data).toHaveProperty('orderNumber');

    // Verify order was created
    const order = await Order.findById(orderResponse.body.data.id);
    expect(order).not.toBeNull();
    expect(order!.total).toBe(orderResponse.body.data.total);

    // Verify stock was updated
    const product = await Product.findById(productId);
    expect(product!.stock).toBe(8); // 10 - 2
  });
});
