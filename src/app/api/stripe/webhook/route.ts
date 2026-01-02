import { NextRequest, NextResponse } from 'next/server';
import { StripeService } from '@/lib/services/stripe.service';
import { OrderService } from '@/lib/services/order.service';
import { headers } from 'next/headers';

const stripeService = new StripeService();
const orderService = new OrderService();

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const signature = headers().get('stripe-signature') as string;
    
    const event = await stripeService.handleWebhook(body, signature);
    
    // Handle the event
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      
      // Update order payment status
      const orderId = session.metadata?.orderId;
      if (orderId) {
        await orderService.updatePaymentStatus(orderId, 'paid');
        await orderService.updateOrderStatus(orderId, 'processing');
      }
    }
    
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 400 }
    );
  }
}