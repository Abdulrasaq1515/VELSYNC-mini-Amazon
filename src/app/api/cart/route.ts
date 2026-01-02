import { NextRequest, NextResponse } from 'next/server';
import { CartService } from '@/lib/services/cart.service';
import { addToCartSchema } from '@/lib/validators/cart.validator';
import { successResponse, errorResponse } from '@/lib/utils/api-response';
import { handleError } from '@/lib/utils/error-handler';
import { auth } from '@/auth';

const cartService = new CartService();

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json(
        errorResponse('Unauthorized', 'UNAUTHORIZED'),
        { status: 401 }
      );
    }
    
    const cart = await cartService.getCart((session.user as any).id);
    
    return NextResponse.json(successResponse(cart));
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json(
        errorResponse('Unauthorized', 'UNAUTHORIZED'),
        { status: 401 }
      );
    }
    
    const body = await req.json();
    const validatedData = addToCartSchema.parse(body);
    
    const cart = await cartService.addToCart((session.user as any).id, validatedData);
    
    return NextResponse.json(successResponse(cart, 'Item added to cart'));
  } catch (error) {
    return handleError(error);
  }
}
