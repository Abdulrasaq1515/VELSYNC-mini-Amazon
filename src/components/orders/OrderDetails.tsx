import { Package, MapPin, CreditCard, Truck } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatPrice, formatDate } from '@/lib/utils/helpers';
import { OrderResponseDTO } from '@/lib/dto/response/order.dto';
import Image from 'next/image';

interface OrderDetailsProps {
  order: OrderResponseDTO;
}

export const OrderDetails: React.FC<OrderDetailsProps> = ({ order }) => {
  const statusColors = {
    pending: 'warning',
    processing: 'default',
    shipped: 'default',
    delivered: 'success',
    cancelled: 'danger',
  } as const;

  return (
    <div className="space-y-6">
      {/* Order Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Order #{order.orderNumber}</CardTitle>
              <p className="mt-1 text-sm text-gray-600">
                Placed on {formatDate(order.createdAt)}
              </p>
            </div>
            <Badge variant={statusColors[order.orderStatus]} className="text-lg">
              {order.orderStatus.charAt(0).toUpperCase() + order.orderStatus.slice(1)}
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {/* Order Items */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Items
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {order.items.map((item, index) => (
            <div key={index} className="flex gap-4">
              <div className="relative h-20 w-20 flex-shrink-0">
                <Image
                  src={item.product.images[0]}
                  alt={item.product.name}
                  fill
                  className="rounded object-cover"
                />
              </div>
              <div className="flex-1">
                <p className="font-medium">{item.product.name}</p>
                <p className="text-sm text-gray-600">
                  Quantity: {item.quantity} × {formatPrice(item.price)}
                </p>
              </div>
              <p className="font-medium">{formatPrice(item.subtotal)}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Shipping Address */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Shipping Address
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="font-medium">{order.shippingAddress.fullName}</p>
          <p className="text-sm text-gray-600">{order.shippingAddress.addressLine1}</p>
          {order.shippingAddress.addressLine2 && (
            <p className="text-sm text-gray-600">{order.shippingAddress.addressLine2}</p>
          )}
          <p className="text-sm text-gray-600">
            {order.shippingAddress.city}, {order.shippingAddress.state}{' '}
            {order.shippingAddress.postalCode}
          </p>
          <p className="text-sm text-gray-600">{order.shippingAddress.country}</p>
          <p className="mt-2 text-sm text-gray-600">{order.shippingAddress.phone}</p>
        </CardContent>
      </Card>

      {/* Order Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Payment Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-600">Subtotal</span>
            <span>{formatPrice(order.subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Shipping</span>
            <span>{order.shipping === 0 ? 'Free' : formatPrice(order.shipping)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Tax</span>
            <span>{formatPrice(order.tax)}</span>
          </div>
          <div className="flex justify-between border-t pt-2 text-lg font-semibold">
            <span>Total</span>
            <span>{formatPrice(order.total)}</span>
          </div>
          <div className="mt-4 rounded-lg bg-gray-50 p-3">
            <p className="text-sm">
              Payment Status:{' '}
              <span
                className={`font-medium ${
                  order.paymentStatus === 'paid' ? 'text-green-600' : 'text-yellow-600'
                }`}
              >
                {order.paymentStatus.charAt(0).toUpperCase() +
                  order.paymentStatus.slice(1)}
              </span>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
export default OrderDetails;