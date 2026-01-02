'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { ProductResponseDTO } from '@/lib/dto/response/product.dto';
import { ShoppingCart } from 'lucide-react';

interface ProductListProps {
  products: ProductResponseDTO[];
  loading: boolean;
  onAddToCart: (productId: string) => void;
}

export function ProductList({ products, loading, onAddToCart }: ProductListProps) {
  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <p className="text-gray-500">No products found</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {products.map((product) => (
        <Card key={product.id} className="overflow-hidden">
          <Link href={`/products/${product.id}`}>
            <div className="relative aspect-square overflow-hidden bg-gray-100">
              {product.images && product.images.length > 0 ? (
                <Image
                  src={product.images[0]}
                  alt={product.name}
                  fill
                  className="object-cover transition-transform hover:scale-105"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-gray-400">
                  No Image
                </div>
              )}
            </div>
          </Link>
          <div className="p-4">
            <Link href={`/products/${product.id}`}>
              <h3 className="font-semibold text-gray-900 hover:text-blue-600">
                {product.name}
              </h3>
            </Link>
            <p className="mt-1 text-sm text-gray-500 line-clamp-2">
              {product.description}
            </p>
            <div className="mt-4 flex items-center justify-between">
              <span className="text-xl font-bold text-gray-900">
                ${product.price.toFixed(2)}
              </span>
              <Button
                size="sm"
                onClick={() => onAddToCart(product.id)}
                disabled={product.stock === 0}
              >
                <ShoppingCart className="mr-2 h-4 w-4" />
                {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
              </Button>
            </div>
            {product.stock > 0 && product.stock < 10 && (
              <p className="mt-2 text-xs text-orange-600">
                Only {product.stock} left in stock
              </p>
            )}
          </div>
        </Card>
      ))}
    </div>
  );
}
