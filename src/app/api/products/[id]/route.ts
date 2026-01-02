import { NextRequest, NextResponse } from 'next/server';
import { ProductService } from '@/lib/services/product.service';
import { updateProductSchema } from '@/lib/validators/product.validator';
import { successResponse, errorResponse } from '@/lib/utils/api-response';
import { handleError } from '@/lib/utils/error-handler';
import { auth } from '@/auth';

const productService = new ProductService();

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const product = await productService.getProductById(params.id);
    
    if (!product) {
      return NextResponse.json(
        errorResponse('Product not found', 'NOT_FOUND'),
        { status: 404 }
      );
    }
    
    return NextResponse.json(successResponse(product));
  } catch (error) {
    return handleError(error);
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
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
    const validatedData = updateProductSchema.parse(body);
    
    // Update product
    const result = await productService.updateProduct(params.id, validatedData);
    
    if (!result) {
      return NextResponse.json(
        errorResponse('Product not found', 'NOT_FOUND'),
        { status: 404 }
      );
    }
    
    return NextResponse.json(successResponse(result, 'Product updated successfully'));
  } catch (error) {
    return handleError(error);
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication and admin role
    const session = await auth();
    if (!session || (session.user as any)?.role !== 'admin') {
      return NextResponse.json(
        errorResponse('Unauthorized', 'UNAUTHORIZED'),
        { status: 401 }
      );
    }
    
    const deleted = await productService.deleteProduct(params.id);
    
    if (!deleted) {
      return NextResponse.json(
        errorResponse('Product not found', 'NOT_FOUND'),
        { status: 404 }
      );
    }
    
    return NextResponse.json(successResponse(null, 'Product deleted successfully'));
  } catch (error) {
    return handleError(error);
  }
}
