'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/toast';
import { ProductResponseDTO } from '@/lib/dto/response/product.dto';
import { ShoppingCart, Minus, Plus } from 'lucide-react';

interface ProductDetailsProps {
  product: ProductResponseDTO;
  onAddToCart: (productId: string, quantity: number) => Promise<void>;
}

export function ProductDetails({ product, onAddToCart }: ProductDetailsProps) {
  const { showToast } = useToast();
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);

  const handleQuantityChange = (delta: number) => {
    const newQuantity = quantity + delta;
    if (newQuantity >= 1 && newQuantity <= product.stock) {
      setQuantity(newQuantity);
    }
  };

  const handleAddToCart = async () => {
    try {
      setLoading(true);
      await onAddToCart(product.id, quantity);
      showToast('Added to cart!', 'success');
      setQuantity(1);
    } catch (error) {
      showToast('Failed to add to cart', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Product Name */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
        {product.category && (
          <Badge className="mt-2">{product.category}</Badge>
        )}
      </div>

      {/* Price */}
      <div className="text-3xl font-bold text-gray-900">
        ${product.price.toFixed(2)}
      </div>

      {/* Stock Status */}
      <div>
        {product.stock > 0 ? (
          <p className="text-green-600">
            In Stock ({product.stock} available)
          </p>
        ) : (
          <p className="text-red-600">Out of Stock</p>
        )}
      </div>

      {/* Description */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900">Description</h2>
        <p className="mt-2 text-gray-600">{product.description}</p>
      </div>

      {/* Quantity Selector */}
      {product.stock > 0 && (
        <div>
          <label className="text-sm font-medium text-gray-700">Quantity</label>
          <div className="mt-2 flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleQuantityChange(-1)}
              disabled={quantity <= 1}
            >
              <Minus className="h-4 w-4" />
            </Button>
            <span className="w-12 text-center text-lg font-medium">
              {quantity}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleQuantityChange(1)}
              disabled={quantity >= product.stock}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Add to Cart Button */}
      <Button
        size="lg"
        className="w-full"
        onClick={handleAddToCart}
        disabled={product.stock === 0 || loading}
      >
        <ShoppingCart className="mr-2 h-5 w-5" />
        {loading ? 'Adding...' : 'Add to Cart'}
      </Button>

      {/* Additional Info */}
      <div className="border-t pt-6">
        <h3 className="text-sm font-semibold text-gray-900">Product Details</h3>
        <dl className="mt-4 space-y-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-gray-600">SKU</dt>
            <dd className="font-medium text-gray-900">{product.id}</dd>
          </div>
          {product.category && (
            <div className="flex justify-between">
              <dt className="text-gray-600">Category</dt>
              <dd className="font-medium text-gray-900">{product.category}</dd>
            </div>
          )}
        </dl>
      </div>
    </div>
  );
}
