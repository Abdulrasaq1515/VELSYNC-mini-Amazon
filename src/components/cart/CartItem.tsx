'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatPrice } from '@/lib/utils/helpers';
import { CartItemResponseDTO } from '@/lib/dto/response/cart.dto';

interface CartItemProps {
  item: CartItemResponseDTO;
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemove: (productId: string) => void;
  loading?: boolean;
}

export const CartItem: React.FC<CartItemProps> = ({
  item,
  onUpdateQuantity,
  onRemove,
  loading,
}) => {
  const { product, quantity, subtotal } = item;

  return (
    <div className="flex gap-4 rounded-lg border p-4">
      {/* Product Image */}
      <Link href={`/products/${product.id}`} className="relative h-24 w-24 flex-shrink-0">
        <Image
          src={product.images[0] || '/placeholder.png'}
          alt={product.name}
          fill
          className="rounded-lg object-cover"
        />
      </Link>

      {/* Product Details */}
      <div className="flex flex-1 flex-col">
        <Link
          href={`/products/${product.id}`}
          className="font-medium text-gray-900 hover:text-blue-600"
        >
          {product.name}
        </Link>
        <p className="mt-1 text-sm text-gray-600">{product.category}</p>

        <div className="mt-auto flex items-center justify-between">
          {/* Quantity Controls */}
          <div className="flex items-center gap-2">
            <Button
              size="icon"
              variant="outline"
              onClick={() => onUpdateQuantity(product.id, quantity - 1)}
              disabled={quantity <= 1 || loading}
            >
              <Minus className="h-4 w-4" />
            </Button>
            <span className="w-12 text-center font-medium">{quantity}</span>
            <Button
              size="icon"
              variant="outline"
              onClick={() => onUpdateQuantity(product.id, quantity + 1)}
              disabled={quantity >= product.stock || loading}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {/* Price */}
          <div className="text-right">
            <p className="font-semibold text-gray-900">{formatPrice(subtotal)}</p>
            <p className="text-xs text-gray-500">
              {formatPrice(product.price)} each
            </p>
          </div>
        </div>
      </div>

      {/* Remove Button */}
      <Button
        size="icon"
        variant="ghost"
        onClick={() => onRemove(product.id)}
        disabled={loading}
        className="text-red-600 hover:bg-red-50 hover:text-red-700"
      >
        <Trash2 className="h-5 w-5" />
      </Button>
    </div>
  );
};
export default CartItem;