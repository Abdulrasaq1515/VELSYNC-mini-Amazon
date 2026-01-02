import { NextRequest, NextResponse } from 'next/server';
import { OrderService } from '@/lib/services/order.service';
import { createOrderSchema } from '@/lib/validators/order.validator';
import { successResponse, errorResponse } from '@/lib/utils/api-response';
import { handleError } from '@/lib/utils/error-handler';
import { auth } from '@/auth';

const orderService = new OrderService();

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json(
        errorResponse('Unauthorized', 'UNAUTHORIZED'),
        { status: 401 }
      );
    }
    
    const { searchParams } = new URL(req.url);
    const page = Number(searchParams.get('page')) || 1;
    const limit = Number(searchParams.get('limit')) || 10;
    
    const orders = await orderService.getUserOrders((session.user as any).id, page, limit);
    
    return NextResponse.json(successResponse(orders));
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
    const validatedData = createOrderSchema.parse(body);
    
    const order = await orderService.createOrder((session.user as any).id, validatedData);
    
    return NextResponse.json(
      successResponse(order, 'Order created successfully'),
      { status: 201 }
    );
  } catch (error) {
    return handleError(error);
  }
}
