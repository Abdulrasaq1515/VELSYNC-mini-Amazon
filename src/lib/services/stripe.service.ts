import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia',
});

export class StripeService {
  async createCheckoutSession(data: {
    orderId: string;
    orderNumber: string;
    items: Array<{ name: string; price: number; quantity: number; image: string }>;
    total: number;
    successUrl: string;
    cancelUrl: string;
  }): Promise<Stripe.Checkout.Session> {
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = data.items.map(
      (item) => ({
        price_data: {
          currency: 'usd',
          product_data: {
            name: item.name,
            images: [item.image],
          },
          unit_amount: Math.round(item.price * 100), // Convert to cents
        },
        quantity: item.quantity,
      })
    );

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: data.successUrl,
      cancel_url: data.cancelUrl,
      metadata: {
        orderId: data.orderId,
        orderNumber: data.orderNumber,
      },
    });

    return session;
  }

  async handleWebhook(body: string, signature: string): Promise<any> {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

    try {
      const event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
      return event;
    } catch (err: any) {
      throw new Error(`Webhook Error: ${err.message}`);
    }
  }
}
