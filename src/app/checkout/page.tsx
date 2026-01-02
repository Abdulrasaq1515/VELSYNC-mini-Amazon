'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CheckoutForm } from '@/components/checkout/CheckoutForm';
import { OrderSummary } from '@/components/checkout/OrderSummary';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useToast } from '@/components/ui/toast';
import { CartResponseDTO } from '@/lib/dto/response/cart.dto';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export default function CheckoutPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [cart, setCart] = useState<CartResponseDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/cart');
      const result = await response.json();

      if (result.success) {
        if (result.data.items.length === 0) {
          showToast('Your cart is empty', 'error');
          router.push('/cart');
          return;
        }
        setCart(result.data);
      }
    } catch (error) {
      showToast('Failed to load cart', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (shippingData: any) => {
    try {
      setProcessing(true);

      // Create order
      const orderResponse = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shippingAddress: shippingData,
          paymentMethod: 'stripe',
          items: cart!.items.map((item) => ({
            productId: item.product.id,
            quantity: item.quantity,
            price: item.product.price,
          })),
        }),
      });

      const orderResult = await orderResponse.json();

      if (!orderResult.success) {
        throw new Error(orderResult.error?.message || 'Failed to create order');
      }

      // Create Stripe checkout session
      const checkoutResponse = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: orderResult.data.id }),
      });

      const checkoutResult = await checkoutResponse.json();

      if (!checkoutResult.success) {
        throw new Error('Failed to create checkout session');
      }

      // Redirect to Stripe
      const stripe = await stripePromise;
      if (stripe) {
        await stripe.redirectToCheckout({
          sessionId: checkoutResult.data.sessionId,
        });
      }
    } catch (error: any) {
      showToast(error.message || 'Checkout failed', 'error');
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return null;
  }

  const tax = cart.total * 0.1;
  const shipping = cart.total > 100 ? 0 : 10;
  const total = cart.total + tax + shipping;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Checkout Form */}
        <div className="lg:col-span-2">
          <CheckoutForm onSubmit={handleSubmit} loading={processing} />
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <OrderSummary
            items={cart.items}
            subtotal={cart.total}
            tax={tax}
            shipping={shipping}
            total={total}
          />
        </div>
      </div>
    </div>
  );
}
