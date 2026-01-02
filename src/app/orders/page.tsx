'use client';

import { useState, useEffect } from 'react';
import { OrderCard } from '@/components/orders/OrderCard';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useToast } from '@/components/ui/toast';
import { OrderResponseDTO } from '@/lib/dto/response/order.dto';

export default function OrdersPage() {
  const { showToast } = useToast();
  const [orders, setOrders] = useState<OrderResponseDTO[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/orders');
      const result = await response.json();

      if (result.success) {
        setOrders(result.data.orders);
      }
    } catch (error) {
      showToast('Failed to load orders', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>

      {orders.length === 0 ? (
        <div className="mt-8 text-center">
          <p className="text-lg text-gray-600">You haven't placed any orders yet</p>
        </div>
      ) : (
        <div className="mt-8 space-y-4">
          {orders.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      )}
    </div>
  );
}
