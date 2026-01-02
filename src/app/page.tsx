import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { ShoppingBag, Truck, Shield, RefreshCw } from 'lucide-react';

export default function HomePage() {
  const categories = [
    {
      name: 'Electronics',
      image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=600&h=400&fit=crop',
      description: 'Latest gadgets & tech',
    },
    {
      name: 'Clothing',
      image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=600&h=400&fit=crop',
      description: 'Fashion for everyone',
    },
    {
      name: 'Home & Kitchen',
      image: 'https://images.unsplash.com/photo-1556911220-bff31c812dba?w=600&h=400&fit=crop',
      description: 'Make your house a home',
    },
    {
      name: 'Sports',
      image: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=600&h=400&fit=crop',
      description: 'Gear up for fitness',
    },
    {
      name: 'Books',
      image: 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=600&h=400&fit=crop',
      description: 'Knowledge & adventure',
    },
    {
      name: 'Toys',
      image: 'https://images.unsplash.com/photo-1558060370-d644479cb6f7?w=600&h=400&fit=crop',
      description: 'Fun for all ages',
    },
  ];

  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl font-bold sm:text-6xl lg:text-7xl animate-fade-in">
              Welcome to <span className="text-yellow-300">miniAmazon</span>
            </h1>
            <p className="mt-6 text-xl sm:text-2xl text-blue-100">
              Discover amazing products at unbeatable prices
            </p>
            <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
              <Link href="/products">
                <Button size="lg" className="bg-yellow-400 text-gray-900 hover:bg-yellow-300 font-semibold px-8 py-6 text-lg shadow-lg">
                  <ShoppingBag className="mr-2 h-5 w-5" />
                  Shop Now
                </Button>
              </Link>
              <Link href="/auth/register">
                <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white hover:text-blue-600 font-semibold px-8 py-6 text-lg">
                  Create Account
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
            <div className="text-center p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
                <Truck className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="mt-4 font-semibold text-lg">Free Shipping</h3>
              <p className="mt-2 text-sm text-gray-600">On orders over $100</p>
            </div>
            <div className="text-center p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                <Shield className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="mt-4 font-semibold text-lg">Secure Payment</h3>
              <p className="mt-2 text-sm text-gray-600">100% secure transactions</p>
            </div>
            <div className="text-center p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-orange-100">
                <RefreshCw className="h-8 w-8 text-orange-600" />
              </div>
              <h3 className="mt-4 font-semibold text-lg">30-Day Returns</h3>
              <p className="mt-2 text-sm text-gray-600">Money back guarantee</p>
            </div>
            <div className="text-center p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-purple-100">
                <ShoppingBag className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="mt-4 font-semibold text-lg">Quality Products</h3>
              <p className="mt-2 text-sm text-gray-600">Curated selection</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Categories */}
      <section className="py-16 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900">
              Shop by Category
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Explore our wide range of products
            </p>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((category) => (
              <Link
                key={category.name}
                href={`/products?category=${encodeURIComponent(category.name)}`}
                className="group relative overflow-hidden rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
              >
                <div className="relative h-64 overflow-hidden">
                  <Image
                    src={category.image}
                    alt={category.name}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                  <h3 className="text-2xl font-bold mb-2 group-hover:text-yellow-300 transition-colors">
                    {category.name}
                  </h3>
                  <p className="text-sm text-gray-200">
                    {category.description}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-700 py-16 text-white">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold">Ready to start shopping?</h2>
          <p className="mt-4 text-xl text-blue-100">
            Join thousands of happy customers today
          </p>
          <Link href="/auth/register">
            <Button size="lg" className="mt-8 bg-yellow-400 text-gray-900 hover:bg-yellow-300 font-semibold px-8 py-6 text-lg shadow-lg">
              Create Your Account
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
