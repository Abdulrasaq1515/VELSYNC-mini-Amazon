'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShoppingCart, User, Menu, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSession, signOut } from 'next-auth/react';
import { useState } from 'react';
import { useCart } from '@/components/providers/CartProvider';

export const Navbar = () => {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { cartCount } = useCart();

  return (
    <nav className="sticky top-0 z-50 border-b bg-white shadow-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="text-2xl font-bold text-blue-600">
            miniAmazon
          </Link>

          {/* Search Bar (Desktop) */}
          <div className="hidden flex-1 max-w-md mx-8 md:block">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <input
                type="search"
                placeholder="Search products..."
                className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 focus:border-blue-600 focus:outline-none"
              />
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden items-center gap-4 md:flex">
            <Link href="/products" className="text-gray-700 hover:text-blue-600">
              Products
            </Link>
            <Link href="/cart" className="relative">
              <ShoppingCart className="h-6 w-6 text-gray-700 hover:text-blue-600" />
              {cartCount > 0 && (
                <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-xs text-white">
                  {cartCount}
                </span>
              )}
            </Link>

            {session ? (
              <div className="flex items-center gap-2">
                {(session.user as any)?.role === 'admin' && (
                  <Link href="/admin">
                    <Button variant="outline" size="sm">
                      Admin
                    </Button>
                  </Link>
                )}
                <Link href="/orders">
                  <Button variant="outline" size="sm">
                    Orders
                  </Button>
                </Link>
                <Button variant="outline" size="sm" onClick={() => signOut()}>
                  Logout
                </Button>
              </div>
            ) : (
              <Link href="/auth/login">
                <Button size="sm">Login</Button>
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="border-t py-4 md:hidden">
            <div className="flex flex-col gap-4">
              <Link href="/products" className="text-gray-700">
                Products
              </Link>
              <Link href="/cart" className="text-gray-700">
                Cart
              </Link>
              {session ? (
                <>
                  <Link href="/orders" className="text-gray-700">
                    Orders
                  </Link>
                  {(session.user as any)?.role === 'admin' && (
                    <Link href="/admin" className="text-gray-700">
                      Admin
                    </Link>
                  )}
                  <button onClick={() => signOut()} className="text-left text-gray-700">
                    Logout
                  </button>
                </>
              ) : (
                <Link href="/auth/login" className="text-gray-700">
                  Login
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};
export default Navbar;