import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Package, Eye, EyeOff, CreditCard, MapPin, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';

interface BankDetails {
  accountHolderName: string;
  bankName: string;
  accountNumber: string;
  routingNumber: string;
  accountType: 'checking' | 'savings';
}

interface OrderWithBankDetails {
  id: number;
  orderNumber: string;
  status: string;
  totalAmount: string;
  shippingAddress: any;
  billingAddress: any;
  paymentMethod: string;
  paymentStatus: string;
  bankDetails: BankDetails | null;
  createdAt: string;
  userId: string;
}

export default function AdminOrdersPage() {
  const { admin } = useAuth();
  const { toast } = useToast();
  const [visibleBankDetails, setVisibleBankDetails] = useState<Record<number, boolean>>({});

  const { data: orders, isLoading, error } = useQuery<OrderWithBankDetails[]>({
    queryKey: ['/api/admin/orders'],
    enabled: !!admin
  });

  const toggleBankDetails = (orderId: number) => {
    setVisibleBankDetails(prev => ({
      ...prev,
      [orderId]: !prev[orderId]
    }));
  };

  const formatPrice = (price: string | number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(Number(price));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending_manual_processing':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'shipped':
        return 'bg-blue-100 text-blue-800';
      case 'delivered':
        return 'bg-purple-100 text-purple-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (!admin) {
    return (
      <div className="min-h-screen pt-16 bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600">You need admin privileges to view this page.</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen pt-16 bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900">Loading orders...</h2>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen pt-16 bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Error Loading Orders</h1>
          <p className="text-gray-600">Unable to fetch order data.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-16 bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Order Management</h1>
          <p className="text-gray-600">View and manage customer orders with bank payment details</p>
        </motion.div>

        {/* Orders List */}
        <div className="space-y-6">
          {orders?.map((order, index) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <Card className="shadow-xl border-0 bg-white">
                <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-2xl font-bold flex items-center gap-3">
                        <Package className="h-6 w-6" />
                        Order #{order.orderNumber}
                      </CardTitle>
                      <div className="flex items-center gap-4 mt-2">
                        <Badge className={`${getStatusColor(order.status)} border-0`}>
                          {order.status.replace('_', ' ').toUpperCase()}
                        </Badge>
                        <span className="text-white/80 flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {formatDate(order.createdAt)}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold">{formatPrice(order.totalAmount)}</div>
                      <div className="text-white/80">Total Amount</div>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Shipping Information */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <MapPin className="h-5 w-5" />
                        Shipping Information
                      </h3>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="space-y-2">
                          <p><strong>Name:</strong> {order.shippingAddress?.fullName}</p>
                          <p><strong>Address:</strong> {order.shippingAddress?.address}</p>
                          <p><strong>City:</strong> {order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.zipCode}</p>
                          <p><strong>Country:</strong> {order.shippingAddress?.country}</p>
                        </div>
                      </div>
                    </div>

                    {/* Bank Details */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <CreditCard className="h-5 w-5" />
                        Bank Payment Details
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleBankDetails(order.id)}
                          className="ml-auto"
                        >
                          {visibleBankDetails[order.id] ? (
                            <>
                              <EyeOff className="h-4 w-4 mr-2" />
                              Hide
                            </>
                          ) : (
                            <>
                              <Eye className="h-4 w-4 mr-2" />
                              Show
                            </>
                          )}
                        </Button>
                      </h3>
                      
                      {order.bankDetails ? (
                        <div className="bg-gray-50 p-4 rounded-lg border-2 border-red-200">
                          <div className="text-sm text-red-600 mb-3 font-medium">
                            ⚠️ Confidential - Admin Access Only
                          </div>
                          
                          {visibleBankDetails[order.id] ? (
                            <div className="space-y-2">
                              <p><strong>Account Holder:</strong> {order.bankDetails.accountHolderName}</p>
                              <p><strong>Bank Name:</strong> {order.bankDetails.bankName}</p>
                              <p><strong>Account Number:</strong> {order.bankDetails.accountNumber}</p>
                              <p><strong>Routing Number:</strong> {order.bankDetails.routingNumber}</p>
                              <p><strong>Account Type:</strong> {order.bankDetails.accountType}</p>
                            </div>
                          ) : (
                            <div className="space-y-2 text-gray-500">
                              <p><strong>Account Holder:</strong> ••••••••••••</p>
                              <p><strong>Bank Name:</strong> ••••••••••••</p>
                              <p><strong>Account Number:</strong> ••••••••••••</p>
                              <p><strong>Routing Number:</strong> ••••••••••••</p>
                              <p><strong>Account Type:</strong> ••••••••••••</p>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <p className="text-gray-500">No bank details provided</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <Separator className="my-6" />

                  {/* Order Actions */}
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-sm text-gray-600">Payment Method: </span>
                      <Badge variant="outline">{order.paymentMethod}</Badge>
                    </div>
                    <div className="space-x-2">
                      <Button variant="outline" size="sm">
                        Update Status
                      </Button>
                      <Button variant="outline" size="sm">
                        Contact Customer
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
          
          {orders?.length === 0 && (
            <div className="text-center py-12">
              <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Orders Found</h3>
              <p className="text-gray-600">No customer orders have been placed yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}