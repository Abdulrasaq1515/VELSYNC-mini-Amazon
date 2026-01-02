import { NextRequest, NextResponse } from 'next/server';
import { StripeService } from '@/lib/services/stripe.service';
import { OrderService } from '@/lib/services/order.service';
import { successResponse, errorResponse } from '@/lib/utils/api-response';
import { handleError } from '@/lib/utils/error-handler';
import { auth } from '@/auth';

const stripeService = new StripeService();
const orderService = new OrderService();

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
    const { orderId } = body;
    
    // Get order
    const order = await orderService.getOrderById(orderId);
    if (!order) {
      return NextResponse.json(
        errorResponse('Order not found', 'NOT_FOUND'),
        { status: 404 }
      );
    }
    
    // Create Stripe checkout session
    const checkoutSession = await stripeService.createCheckoutSession({
      orderId: order.id,
      orderNumber: order.orderNumber,
      items: order.items.map((item) => ({
        name: item.product.name,
        price: item.price,
        quantity: item.quantity,
        image: item.product.images[0],
      })),
      total: order.total,
      successUrl: `${process.env.NEXT_PUBLIC_APP_URL}/orders/${order.id}?success=true`,
      cancelUrl: `${process.env.NEXT_PUBLIC_APP_URL}/checkout?canceled=true`,
    });
    
    return NextResponse.json(successResponse({ sessionId: checkoutSession.id }));
  } catch (error) {
    return handleError(error);
  }
}
