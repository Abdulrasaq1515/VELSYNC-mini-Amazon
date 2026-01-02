'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ProductList } from '@/components/products/ProductList';
import { ProductFilter } from '@/components/products/ProductFilter';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';
import { useCart } from '@/components/providers/CartProvider';
import { ProductResponseDTO } from '@/lib/dto/response/product.dto';

export default function ProductsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showToast } = useToast();
  const { refreshCart, addToGuestCart } = useCart();

  const [products, setProducts] = useState<ProductResponseDTO[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalProducts: 0,
  });

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [searchParams]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams(searchParams.toString());
      const url = `/api/products?${params}`;
      console.log('Fetching products from:', url);
      console.log('Category filter:', searchParams.get('category'));
      
      const response = await fetch(url);
      const result = await response.json();
      
      console.log('Products API response:', result);

      if (result.success) {
        setProducts(result.data.products);
        setPagination(result.data.pagination);
        console.log('Products loaded:', result.data.products.length);
        
        if (result.data.products.length === 0) {
          const category = searchParams.get('category');
          if (category) {
            showToast(`No products found in ${category} category`, 'error');
          } else {
            showToast('No products found. Please run: npm run seed', 'error');
          }
        }
      } else {
        console.error('API returned error:', result);
        showToast(result.error?.message || 'Failed to load products', 'error');
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      showToast('Failed to load products. Check if MongoDB is running.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/products/categories');
      const result = await response.json();
      if (result.success) {
        setCategories(result.data);
      }
    } catch (error) {
      console.error('Failed to load categories');
    }
  };

  const handleFilterChange = (filters: any) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.set(key, String(value));
    });
    router.push(`/products?${params.toString()}`);
  };

  const handleAddToCart = async (productId: string) => {
    try {
      console.log('Adding product to cart:', productId);
      
      const session = await fetch('/api/auth/session').then(r => r.json());
      
      // If not logged in, add to guest cart (localStorage)
      if (!session || !session.user) {
        console.log('Guest user - adding to localStorage cart');
        addToGuestCart(productId, 1);
        showToast('Added to cart! Login to checkout.', 'success');
        return;
      }
      
      // If logged in, add to server cart
      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, quantity: 1 }),
      });

      const result = await response.json();
      console.log('Add to cart response:', result);

      if (response.ok) {
        showToast('Added to cart!', 'success');
        await refreshCart(); // Refresh cart count
      } else {
        showToast(result.error?.message || 'Failed to add to cart', 'error');
      }
    } catch (error) {
      console.error('Add to cart error:', error);
      showToast('An error occurred. Please try again.', 'error');
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-gray-900">Products</h1>

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-4">
        {/* Filters Sidebar */}
        <aside className="lg:col-span-1">
          <ProductFilter categories={categories} onFilterChange={handleFilterChange} />
        </aside>

        {/* Products Grid */}
        <div className="lg:col-span-3">
          <ProductList
            products={products}
            loading={loading}
            onAddToCart={handleAddToCart}
          />

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="mt-8 flex justify-center gap-2">
              {[...Array(pagination.totalPages)].map((_, i) => (
                <Button
                  key={i}
                  variant={pagination.currentPage === i + 1 ? 'default' : 'outline'}
                  onClick={() => {
                    const params = new URLSearchParams(searchParams.toString());
                    params.set('page', String(i + 1));
                    router.push(`/products?${params.toString()}`);
                  }}
                >
                  {i + 1}
                </Button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
