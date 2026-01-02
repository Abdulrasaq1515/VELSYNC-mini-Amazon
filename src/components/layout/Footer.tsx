import Link from 'next/link';

export const Footer = () => {
  return (
    <footer className="border-t bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">miniAmazon</h3>
            <p className="mt-2 text-sm text-gray-600">
              Your one-stop shop for everything you need.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900">Shop</h4>
            <ul className="mt-4 space-y-2">
              <li>
                <Link href="/products" className="text-sm text-gray-600 hover:text-blue-600">
                  All Products
                </Link>
              </li>
              <li>
                <Link href="/products?category=Electronics" className="text-sm text-gray-600 hover:text-blue-600">
                  Electronics
                </Link>
              </li>
              <li>
                <Link href="/products?category=Clothing" className="text-sm text-gray-600 hover:text-blue-600">
                  Clothing
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900">Support</h4>
            <ul className="mt-4 space-y-2">
              <li>
                <Link href="/help" className="text-sm text-gray-600 hover:text-blue-600">
                  Help Center
                </Link>
              </li>
              <li>
                <Link href="/shipping" className="text-sm text-gray-600 hover:text-blue-600">
                  Shipping Info
                </Link>
              </li>
              <li>
                <Link href="/returns" className="text-sm text-gray-600 hover:text-blue-600">
                  Returns
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900">Legal</h4>
            <ul className="mt-4 space-y-2">
              <li>
                <Link href="/privacy" className="text-sm text-gray-600 hover:text-blue-600">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-sm text-gray-600 hover:text-blue-600">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t pt-8 text-center text-sm text-gray-600">
          © 2025 miniAmazon. All rights reserved.
        </div>
      </div>
    </footer>
  );
};
export default Footer;
