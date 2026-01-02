'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useSession } from 'next-auth/react';

interface CartItem {
  productId: string;
  quantity: number;
}

interface CartContextType {
  cartCount: number;
  refreshCart: () => Promise<void>;
  addToGuestCart: (productId: string, quantity: number) => void;
  getGuestCart: () => CartItem[];
  clearGuestCart: () => void;
}

const CartContext = createContext<CartContextType>({
  cartCount: 0,
  refreshCart: async () => {},
  addToGuestCart: () => {},
  getGuestCart: () => [],
  clearGuestCart: () => {},
});

const GUEST_CART_KEY = 'miniAmazon_guestCart';

export function CartProvider({ children }: { children: ReactNode }) {
  const { data: session } = useSession();
  const [cartCount, setCartCount] = useState(0);

  // Get guest cart from localStorage
  const getGuestCart = (): CartItem[] => {
    if (typeof window === 'undefined') return [];
    try {
      const cart = localStorage.getItem(GUEST_CART_KEY);
      return cart ? JSON.parse(cart) : [];
    } catch {
      return [];
    }
  };

  // Add item to guest cart
  const addToGuestCart = (productId: string, quantity: number) => {
    const cart = getGuestCart();
    const existingItem = cart.find(item => item.productId === productId);
    
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.push({ productId, quantity });
    }
    
    localStorage.setItem(GUEST_CART_KEY, JSON.stringify(cart));
    
    // Update cart count
    const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    setCartCount(totalCount);
  };

  // Clear guest cart
  const clearGuestCart = () => {
    localStorage.removeItem(GUEST_CART_KEY);
    setCartCount(0);
  };

  // Refresh cart count
  const refreshCart = async () => {
    if (!session) {
      // For guest users, count items in localStorage
      const guestCart = getGuestCart();
      const totalCount = guestCart.reduce((sum, item) => sum + item.quantity, 0);
      setCartCount(totalCount);
      return;
    }

    try {
      const response = await fetch('/api/cart');
      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          setCartCount(result.data.itemCount || 0);
        }
      } else {
        // If API fails, fall back to guest cart
        const guestCart = getGuestCart();
        const totalCount = guestCart.reduce((sum, item) => sum + item.quantity, 0);
        setCartCount(totalCount);
      }
    } catch (error) {
      console.error('Failed to fetch cart:', error);
      // Fall back to guest cart
      const guestCart = getGuestCart();
      const totalCount = guestCart.reduce((sum, item) => sum + item.quantity, 0);
      setCartCount(totalCount);
    }
  };

  // Sync guest cart to server when user logs in
  useEffect(() => {
    const syncGuestCart = async () => {
      if (!session) return;
      
      const guestCart = getGuestCart();
      if (guestCart.length === 0) {
        console.log('No guest cart to sync');
        await refreshCart();
        return;
      }

      console.log('🔄 Syncing guest cart to server...', guestCart);

      // Add each guest cart item to the server
      for (const item of guestCart) {
        try {
          console.log('  Adding item:', item.productId);
          const response = await fetch('/api/cart', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              productId: item.productId, 
              quantity: item.quantity 
            }),
          });
          
          if (!response.ok) {
            const error = await response.json();
            console.error('  Failed to sync item:', error);
          } else {
            console.log('  ✅ Item synced');
          }
        } catch (error) {
          console.error('  Failed to sync cart item:', error);
        }
      }

      // Clear guest cart after syncing
      console.log('🧹 Clearing guest cart');
      clearGuestCart();
      
      // Refresh cart from server
      console.log('🔄 Refreshing cart from server');
      await refreshCart();
    };

    syncGuestCart();
  }, [session]);

  // Initial cart load
  useEffect(() => {
    refreshCart();
  }, [session]);

  return (
    <CartContext.Provider value={{ cartCount, refreshCart, addToGuestCart, getGuestCart, clearGuestCart }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
