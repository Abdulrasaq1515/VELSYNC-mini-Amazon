import Product, { IProduct } from '../models/Product';
import { connectDB } from '../config/database';
export class ProductRepository {
  async findById(id: string): Promise<IProduct | null> {
    await connectDB();
    return Product.findById(id);
  }

  async findAll(filters: {
    page?: number;
    limit?: number;
    category?: string;
    search?: string;
    minPrice?: number;
    maxPrice?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<{ products: IProduct[]; total: number }> {
    await connectDB();
    
    const { page = 1, limit = 12, category, search, minPrice, maxPrice, sortBy = 'createdAt', sortOrder = 'desc' } = filters;
    const skip = (page - 1) * limit;

    // Build query
    const query: any = {};
    
    if (category) {
      query.category = category;
      console.log('🔍 MongoDB Query - Category filter:', category);
    }
    
    if (search) {
      query.$text = { $search: search };
    }
    
    if (minPrice !== undefined || maxPrice !== undefined) {
      query.price = {};
      if (minPrice !== undefined) query.price.$gte = minPrice;
      if (maxPrice !== undefined) query.price.$lte = maxPrice;
    }

    console.log('🔍 MongoDB Query:', JSON.stringify(query));

    // Build sort
    const sort: any = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const [products, total] = await Promise.all([
      Product.find(query).sort(sort).skip(skip).limit(limit),
      Product.countDocuments(query),
    ]);

    console.log('📊 MongoDB Results:', products.length, 'products found, total:', total);

    return { products, total };
  }

  async create(productData: Partial<IProduct>): Promise<IProduct> {
    await connectDB();
    const product = new Product(productData);
    await product.save();
    return product;
  }

  async update(id: string, productData: Partial<IProduct>): Promise<IProduct | null> {
    await connectDB();
    return Product.findByIdAndUpdate(id, productData, { new: true, runValidators: true });
  }

  async delete(id: string): Promise<boolean> {
    await connectDB();
    const result = await Product.findByIdAndDelete(id);
    return !!result;
  }

  async getCategories(): Promise<string[]> {
    await connectDB();
    return Product.distinct('category');
  }

  async updateStock(id: string, quantity: number): Promise<IProduct | null> {
    await connectDB();
    return Product.findByIdAndUpdate(
      id,
      { $inc: { stock: -quantity } },
      { new: true }
    );
  }
}