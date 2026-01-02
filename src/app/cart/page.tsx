'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { CartItem } from '@/components/cart/CartItem';
import { CartSummary } from '@/components/cart/CartSummary';
import { EmptyCart } from '@/components/cart/EmptyCart';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useToast } from '@/components/ui/toast';
import { useCart } from '@/components/providers/CartProvider';
import { CartResponseDTO } from '@/lib/dto/response/cart.dto';

export default function CartPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const { showToast } = useToast();
  const { getGuestCart, refreshCart } = useCart();
  const [cart, setCart] = useState<CartResponseDTO | null>(null);
  const [guestCartItems, setGuestCartItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchCart();
  }, [session]);

  const fetchCart = async () => {
    try {
      setLoading(true);
      
      if (!session) {
        // Guest user - load from localStorage
        const guestCart = getGuestCart();
        console.log('Guest cart:', guestCart);
        
        if (guestCart.length === 0) {
          setGuestCartItems([]);
          setLoading(false);
          return;
        }
        
        // Fetch product details for guest cart items
        const items = await Promise.all(
          guestCart.map(async (item) => {
            try {
              const response = await fetch(`/api/products/${item.productId}`);
              const result = await response.json();
              if (result.success) {
                return {
                  id: item.productId,
                  product: result.data,
                  quantity: item.quantity,
                  subtotal: result.data.price * item.quantity,
                };
              }
            } catch (error) {
              console.error('Failed to fetch product:', error);
            }
            return null;
          })
        );
        
        setGuestCartItems(items.filter(item => item !== null));
      } else {
        // Logged-in user - fetch from server
        const response = await fetch('/api/cart');
        const result = await response.json();

        if (result.success) {
          setCart(result.data);
        }
      }
    } catch (error) {
      showToast('Failed to load cart', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateQuantity = async (productId: string, quantity: number) => {
    if (!session) {
      // Guest user - update localStorage
      const guestCart = getGuestCart();
      const item = guestCart.find(i => i.productId === productId);
      if (item) {
        item.quantity = quantity;
        localStorage.setItem('miniAmazon_guestCart', JSON.stringify(guestCart));
        await fetchCart();
        await refreshCart();
      }
      return;
    }

    try {
      setUpdating(true);
      const response = await fetch(`/api/cart/${productId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity }),
      });

      const result = await response.json();

      if (result.success) {
        setCart(result.data);
        showToast('Cart updated', 'success');
      } else {
        showToast(result.error?.message || 'Failed to update cart', 'error');
      }
    } catch (error) {
      showToast('An error occurred', 'error');
    } finally {
      setUpdating(false);
    }
  };

  const handleRemove = async (productId: string) => {
    if (!session) {
      // Guest user - remove from localStorage
      const guestCart = getGuestCart();
      const updatedCart = guestCart.filter(i => i.productId !== productId);
      localStorage.setItem('miniAmazon_guestCart', JSON.stringify(updatedCart));
      await fetchCart();
      await refreshCart();
      showToast('Item removed from cart', 'success');
      return;
    }

    try {
      setUpdating(true);
      const response = await fetch(`/api/cart/${productId}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (result.success) {
        setCart(result.data);
        showToast('Item removed from cart', 'success');
      } else {
        showToast('Failed to remove item', 'error');
      }
    } catch (error) {
      showToast('An error occurred', 'error');
    } finally {
      setUpdating(false);
    }
  };

  const handleCheckout = () => {
    if (!session) {
      showToast('Please login to checkout', 'error');
      router.push('/auth/login?redirect=/cart');
      return;
    }
    router.push('/checkout');
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  // Handle guest cart
  if (!session) {
    if (guestCartItems.length === 0) {
      return <EmptyCart />;
    }

    const subtotal = guestCartItems.reduce((sum, item) => sum + item.subtotal, 0);
    const tax = subtotal * 0.1;
    const shipping = subtotal > 100 ? 0 : 10;
    const total = subtotal + tax + shipping;
    const itemCount = guestCartItems.reduce((sum, item) => sum + item.quantity, 0);

    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>
        <p className="mt-2 text-sm text-gray-600">
          Login to save your cart and checkout
        </p>

        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="space-y-4">
              {guestCartItems.map((item) => (
                <CartItem
                  key={item.id}
                  item={item}
                  onUpdateQuantity={handleUpdateQuantity}
                  onRemove={handleRemove}
                  loading={updating}
                />
              ))}
            </div>
          </div>

          {/* Cart Summary */}
          <div className="lg:col-span-1">
            <CartSummary
              subtotal={subtotal}
              tax={tax}
              shipping={shipping}
              total={total}
              itemCount={itemCount}
              onCheckout={handleCheckout}
              loading={updating}
            />
          </div>
        </div>
      </div>
    );
  }

  // Handle logged-in user cart
  if (!cart || cart.items.length === 0) {
    return <EmptyCart />;
  }

  const tax = cart.total * 0.1;
  const shipping = cart.total > 100 ? 0 : 10;
  const total = cart.total + tax + shipping;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Cart Items */}
        <div className="lg:col-span-2">
          <div className="space-y-4">
            {cart.items.map((item) => (
              <CartItem
                key={item.id}
                item={item}
                onUpdateQuantity={handleUpdateQuantity}
                onRemove={handleRemove}
                loading={updating}
              />
            ))}
          </div>
        </div>

        {/* Cart Summary */}
        <div className="lg:col-span-1">
          <CartSummary
            subtotal={cart.total}
            tax={tax}
            shipping={shipping}
            total={total}
            itemCount={cart.itemCount}
            onCheckout={handleCheckout}
            loading={updating}
          />
        </div>
      </div>
    </div>
  );
}
