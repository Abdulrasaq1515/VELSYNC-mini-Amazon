import Link from 'next/link';
import { ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const EmptyCart = () => {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <ShoppingCart className="h-24 w-24 text-gray-300" />
      <h2 className="mt-4 text-2xl font-semibold text-gray-900">Your cart is empty</h2>
      <p className="mt-2 text-gray-600">Start shopping to add items to your cart</p>
      <Link href="/products">
        <Button className="mt-6">Browse Products</Button>
      </Link>
    </div>
  );
};
export default EmptyCart;