'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { OrderTable } from '@/components/admin/OrderTable';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { OrderResponseDTO } from '@/lib/dto/response/order.dto';

export default function AdminOrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<OrderResponseDTO[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/orders?limit=100');
      const result = await response.json();
      if (result.success) {
        setOrders(result.data.orders);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleViewOrder = (orderId: string) => {
    router.push(`/orders/${orderId}`);
  };

  const handleUpdateStatus = async (orderId: string, status: string) => {
    // Implement status update
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Orders</h1>

      <div className="rounded-lg border bg-white">
        <OrderTable
          orders={orders}
          onViewOrder={handleViewOrder}
          onUpdateStatus={handleUpdateStatus}
        />
      </div>
    </div>
  );
}