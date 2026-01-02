'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { OrderDetails } from '@/components/orders/OrderDetails';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useToast } from '@/components/ui/toast';
import { OrderResponseDTO } from '@/lib/dto/response/order.dto';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function OrderDetailPage() {
  const params = useParams();
  const { showToast } = useToast();
  const [order, setOrder] = useState<OrderResponseDTO | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrder();
  }, [params.id]);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/orders/${params.id}`);
      const result = await response.json();

      if (result.success) {
        setOrder(result.data);
      } else {
        showToast('Order not found', 'error');
      }
    } catch (error) {
      showToast('Failed to load order', 'error');
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

  if (!order) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-lg text-gray-600">Order not found</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Link href="/orders">
        <Button variant="ghost" className="mb-6 gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Orders
        </Button>
      </Link>

      <OrderDetails order={order} />
    </div>
  );
}