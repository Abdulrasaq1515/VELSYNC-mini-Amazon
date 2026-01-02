import request from 'supertest';
import { app } from '../../app';
import Product from '../../lib/models/Product';

describe('Products Integration Tests', () => {
  describe('GET /api/products', () => {
    beforeEach(async () => {
      await Product.create([
        {
          name: 'Product 1',
          description: 'Description 1',
          price: 10,
          category: 'Electronics',
          stock: 5,
          images: ['img1.jpg'],
        },
        {
          name: 'Product 2',
          description: 'Description 2',
          price: 20,
          category: 'Books',
          stock: 10,
          images: ['img2.jpg'],
        },
      ]);
    });

    it('should return all products', async () => {
      const response = await request(app).get('/api/products');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.products).toHaveLength(2);
    });

    it('should filter products by category', async () => {
      const response = await request(app).get('/api/products?category=Electronics');

      expect(response.status).toBe(200);
      expect(response.body.data.products).toHaveLength(1);
      expect(response.body.data.products[0].category).toBe('Electronics');
    });

    it('should paginate results', async () => {
      const response = await request(app).get('/api/products?page=1&limit=1');

      expect(response.status).toBe(200);
      expect(response.body.data.products).toHaveLength(1);
      expect(response.body.data.pagination.totalProducts).toBe(2);
    });
  });

  describe('POST /api/products', () => {
    it('should create a product (admin only)', async () => {
      // Mock admin authentication
      const response = await request(app)
        .post('/api/products')
        .set('Authorization', 'Bearer admin-token')
        .send({
          name: 'New Product',
          description: 'New Description',
          price: 50,
          category: 'Electronics',
          stock: 100,
          images: ['img.jpg'],
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe('New Product');
    });
  });
});
