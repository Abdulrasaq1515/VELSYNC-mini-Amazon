import Link from 'next/link';
import { Package, ChevronRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatPrice, formatDate } from '@/lib/utils/helpers';
import { OrderResponseDTO } from '@/lib/dto/response/order.dto';

interface OrderCardProps {
  order: OrderResponseDTO;
}

export const OrderCard: React.FC<OrderCardProps> = ({ order }) => {
  const statusColors = {
    pending: 'warning',
    processing: 'default',
    shipped: 'default',
    delivered: 'success',
    cancelled: 'danger',
  } as const;

  return (
    <Link href={`/orders/${order.id}`}>
      <Card className="transition-shadow hover:shadow-lg">
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex gap-4">
              <div className="rounded-lg bg-blue-50 p-3">
                <Package className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">Order #{order.orderNumber}</p>
                <p className="text-sm text-gray-600">
                  Placed on {formatDate(order.createdAt)}
                </p>
                <p className="mt-1 text-sm text-gray-600">
                  {order.items.length} item{order.items.length > 1 ? 's' : ''}
                </p>
              </div>
            </div>

            <div className="text-right">
              <Badge variant={statusColors[order.orderStatus]}>
                {order.orderStatus.charAt(0).toUpperCase() + order.orderStatus.slice(1)}
              </Badge>
              <p className="mt-2 font-semibold">{formatPrice(order.total)}</p>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between border-t pt-4">
            <p className="text-sm text-gray-600">
              Payment: {order.paymentStatus === 'paid' ? '✓ Paid' : 'Pending'}
            </p>
            <ChevronRight className="h-5 w-5 text-gray-400" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};
export default OrderCard;