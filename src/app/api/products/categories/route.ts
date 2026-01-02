import { NextRequest, NextResponse } from 'next/server';
import { ProductService } from '@/lib/services/product.service';
import { successResponse } from '@/lib/utils/api-response';
import { handleError } from '@/lib/utils/error-handler';

const productService = new ProductService();

export async function GET(req: NextRequest) {
  try {
    const categories = await productService.getCategories();
    
    return NextResponse.json(successResponse(categories));
  } catch (error) {
    return handleError(error);
  }
}
