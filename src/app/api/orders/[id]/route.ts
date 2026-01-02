import { NextRequest, NextResponse } from 'next/server';
import { OrderService } from '@/lib/services/order.service';
import { successResponse, errorResponse } from '@/lib/utils/api-response';
import { handleError } from '@/lib/utils/error-handler';
import { auth } from '@/auth';

const orderService = new OrderService();

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json(
        errorResponse('Unauthorized', 'UNAUTHORIZED'),
        { status: 401 }
      );
    }
    
    const order = await orderService.getOrderById(params.id);
    
    if (!order) {
      return NextResponse.json(
        errorResponse('Order not found', 'NOT_FOUND'),
        { status: 404 }
      );
    }
    
    // Check if user owns the order or is admin
    if (
      order.userId !== (session.user as any).id &&
      (session.user as any)?.role !== 'admin'
    ) {
      return NextResponse.json(
        errorResponse('Unauthorized', 'UNAUTHORIZED'),
        { status: 403 }
      );
    }
    
    return NextResponse.json(successResponse(order));
  } catch (error) {
    return handleError(error);
  }
}

