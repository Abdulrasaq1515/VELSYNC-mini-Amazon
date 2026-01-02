import { NextRequest, NextResponse } from 'next/server';
import { CartService } from '@/lib/services/cart.service';
import { updateCartItemSchema } from '@/lib/validators/cart.validator';
import { successResponse, errorResponse } from '@/lib/utils/api-response';
import { handleError } from '@/lib/utils/error-handler';
import { auth } from '@/auth';

const cartService = new CartService();

export async function PUT(
  req: NextRequest,
  { params }: { params: { productId: string } }
) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json(
        errorResponse('Unauthorized', 'UNAUTHORIZED'),
        { status: 401 }
      );
    }
    
    const body = await req.json();
    const validatedData = updateCartItemSchema.parse(body);
    
    const cart = await cartService.updateCartItem(
      (session.user as any).id,
      params.productId,
      validatedData
    );
    
    return NextResponse.json(successResponse(cart, 'Cart updated'));
  } catch (error) {
    return handleError(error);
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { productId: string } }
) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json(
        errorResponse('Unauthorized', 'UNAUTHORIZED'),
        { status: 401 }
      );
    }
    
    const cart = await cartService.removeFromCart(
      (session.user as any).id,
      params.productId
    );
    
    return NextResponse.json(successResponse(cart, 'Item removed from cart'));
  } catch (error) {
    return handleError(error);
  }
}