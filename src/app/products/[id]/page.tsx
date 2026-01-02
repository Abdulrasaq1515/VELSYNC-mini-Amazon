'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { ProductGallery } from '@/components/products/ProductGallery';
import { ProductDetails } from '@/components/products/ProductDetails';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useToast } from '@/components/ui/toast';
import { ProductResponseDTO } from '@/lib/dto/response/product.dto';

export default function ProductDetailPage() {
  const params = useParams();
  const { showToast } = useToast();
  const [product, setProduct] = useState<ProductResponseDTO | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProduct();
  }, [params.id]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/products/${params.id}`);
      const result = await response.json();

      if (result.success) {
        setProduct(result.data);
      } else {
        showToast('Product not found', 'error');
      }
    } catch (error) {
      showToast('Failed to load product', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (productId: string, quantity: number) => {
    const response = await fetch('/api/cart', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId, quantity }),
    });

    if (!response.ok) {
      throw new Error('Failed to add to cart');
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-lg text-gray-600">Product not found</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <ProductGallery images={product.images} productName={product.name} />
        <ProductDetails product={product} onAddToCart={handleAddToCart} />
      </div>
    </div>
  );
}
