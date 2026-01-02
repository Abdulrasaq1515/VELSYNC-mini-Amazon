import { NextRequest, NextResponse } from 'next/server';
import { ProductService } from '@/lib/services/product.service';
import { createProductSchema, getProductsSchema } from '@/lib/validators/product.validator';
import { successResponse } from '@/lib/utils/api-response';
import { handleError } from '@/lib/utils/error-handler';
import { auth } from '@/auth';

const productService = new ProductService();

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    
    const params = {
      page: Number(searchParams.get('page')) || 1,
      limit: Number(searchParams.get('limit')) || 12,
      category: searchParams.get('category') || undefined,
      search: searchParams.get('search') || undefined,
      minPrice: searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : undefined,
      maxPrice: searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : undefined,
      sortBy: (searchParams.get('sortBy') as any) || 'createdAt',
      sortOrder: (searchParams.get('sortOrder') as any) || 'desc',
    };
    
    // Log for debugging
    console.log('📥 Products API Request:');
    console.log('  URL:', req.url);
    console.log('  Category param:', searchParams.get('category'));
    console.log('  Parsed params:', params);
    
    // Validate params
    const validatedParams = getProductsSchema.parse(params);
    console.log('  Validated params:', validatedParams);
    
    // Get products
    const result = await productService.getProducts(validatedParams);
    console.log('  Products found:', result.products.length);
    
    return NextResponse.json(successResponse(result));
  } catch (error) {
    console.error('❌ Products API Error:', error);
    return handleError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    // Check authentication and admin role
    const session = await auth();
    if (!session || (session.user as any)?.role !== 'admin') {
      return NextResponse.json(
        errorResponse('Unauthorized', 'UNAUTHORIZED'),
        { status: 401 }
      );
    }
    
    const body = await req.json();
    
    // Validate request
    const validatedData = createProductSchema.parse(body);
    
    // Create product
    const result = await productService.createProduct(validatedData);
    
    return NextResponse.json(successResponse(result, 'Product created successfully'), {
      status: 201,
    });
  } catch (error) {
    return handleError(error);
  }
}
