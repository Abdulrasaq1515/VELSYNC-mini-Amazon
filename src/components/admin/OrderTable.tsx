import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatPrice, formatDate } from '@/lib/utils/helpers';
import { OrderResponseDTO } from '@/lib/dto/response/order.dto';

interface OrderTableProps {
  orders: OrderResponseDTO[];
  onViewOrder: (orderId: string) => void;
  onUpdateStatus: (orderId: string, status: string) => void;
}

export const OrderTable: React.FC<OrderTableProps> = ({
  orders,
  onViewOrder,
  onUpdateStatus,
}) => {
  const statusColors = {
    pending: 'warning',
    processing: 'default',
    shipped: 'default',
    delivered: 'success',
    cancelled: 'danger',
  } as const;

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">
              Order #
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">
              Customer
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">
              Date
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">
              Total
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {orders.map((order) => (
            <tr key={order.id}>
              <td className="whitespace-nowrap px-6 py-4 text-sm font-medium">
                #{order.orderNumber}
              </td>
              <td className="whitespace-nowrap px-6 py-4 text-sm">
                {order.shippingAddress.fullName}
              </td>
              <td className="whitespace-nowrap px-6 py-4 text-sm">
                {formatDate(order.createdAt)}
              </td>
              <td className="whitespace-nowrap px-6 py-4 text-sm font-medium">
                {formatPrice(order.total)}
              </td>
              <td className="whitespace-nowrap px-6 py-4">
                <Badge variant={statusColors[order.orderStatus]}>
                  {order.orderStatus.charAt(0).toUpperCase() + order.orderStatus.slice(1)}
                </Badge>
              </td>
              <td className="whitespace-nowrap px-6 py-4 text-sm">
                <Button size="sm" variant="outline" onClick={() => onViewOrder(order.id)}>
                  View
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
