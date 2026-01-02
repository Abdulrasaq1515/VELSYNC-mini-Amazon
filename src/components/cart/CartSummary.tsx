'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatPrice } from '@/lib/utils/helpers';

interface CartSummaryProps {
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  itemCount: number;
  onCheckout: () => void;
  loading?: boolean;
}

export const CartSummary: React.FC<CartSummaryProps> = ({
  subtotal,
  tax,
  shipping,
  total,
  itemCount,
  onCheckout,
  loading,
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Order Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Subtotal ({itemCount} items)</span>
            <span className="font-medium">{formatPrice(subtotal)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Shipping</span>
            <span className="font-medium">
              {shipping === 0 ? 'Free' : formatPrice(shipping)}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Tax (10%)</span>
            <span className="font-medium">{formatPrice(tax)}</span>
          </div>
        </div>

        <div className="border-t pt-4">
          <div className="flex justify-between">
            <span className="text-lg font-semibold">Total</span>
            <span className="text-lg font-semibold">{formatPrice(total)}</span>
          </div>
        </div>

        <Button
          onClick={onCheckout}
          disabled={itemCount === 0 || loading}
          className="w-full"
          size="lg"
        >
          {loading ? 'Processing...' : 'Proceed to Checkout'}
        </Button>

        {subtotal < 100 && (
          <p className="text-center text-sm text-gray-600">
            Add {formatPrice(100 - subtotal)} more for free shipping!
          </p>
        )}
      </CardContent>
    </Card>
  );
};
export default CartSummary;