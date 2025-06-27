import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Users, Package, ShoppingCart, DollarSign, Eye, EyeOff, CheckCircle, XCircle, Calendar, CreditCard, MapPin } from 'lucide-react';
import { Link } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

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

interface CustomerContact {
  email: string;
  orderId: number;
  orderNumber: string;
}

interface PendingUser {
  id: number;
  email: string;
  fullName: string;
  licenseNumber: string;
  collegeName: string;
  provinceState: string;
  practiceName: string;
  practiceAddress: string;
  isApproved: boolean;
  isLicenseVerified: boolean;
  createdAt: string;
}

export default function AdminSimpleDashboard() {
  const { admin } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [visibleBankDetails, setVisibleBankDetails] = useState<Record<number, boolean>>({});
  const [customerContact, setCustomerContact] = useState<CustomerContact | null>(null);

  const { data: pendingUsers, isLoading: usersLoading } = useQuery<PendingUser[]>({
    queryKey: ['/api/admin/pending-users'],
    enabled: !!admin
  });

  const { data: orders, isLoading: ordersLoading } = useQuery<OrderWithBankDetails[]>({
    queryKey: ['/api/admin/orders'],
    enabled: !!admin
  });

  const pendingOrders = orders?.filter(order => order.status === 'pending_manual_processing') || [];

  const approveOrderMutation = useMutation({
    mutationFn: async (orderId: number) => {
      await apiRequest('PATCH', `/api/admin/orders/${orderId}/approve`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/orders'] });
      toast({
        title: "Success",
        description: "Order approved successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to approve order",
        variant: "destructive",
      });
    }
  });

  const rejectOrderMutation = useMutation({
    mutationFn: async (orderId: number) => {
      await apiRequest('PATCH', `/api/admin/orders/${orderId}/reject`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/orders'] });
      toast({
        title: "Success",
        description: "Order rejected and removed successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to reject order",
        variant: "destructive",
      });
    }
  });

  const contactCustomerMutation = useMutation({
    mutationFn: async (orderId: number): Promise<CustomerContact> => {
      const response = await apiRequest('GET', `/api/admin/orders/${orderId}/customer-email`);
      return await response.json();
    },
    onSuccess: (data) => {
      setCustomerContact(data);
      toast({
        title: "Customer Contact Information",
        description: `Customer email: ${data.email}`,
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to get customer contact information",
        variant: "destructive",
      });
    }
  });

  const approveUserMutation = useMutation({
    mutationFn: async (userId: number) => {
      await apiRequest('POST', `/api/admin/approve-user/${userId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/pending-users'] });
      toast({
        title: "Success",
        description: "User approved successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to approve user",
        variant: "destructive",
      });
    }
  });

  const rejectUserMutation = useMutation({
    mutationFn: async (userId: number) => {
      await apiRequest('DELETE', `/api/admin/reject-user/${userId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/pending-users'] });
      toast({
        title: "Success",
        description: "User rejected successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to reject user",
        variant: "destructive",
      });
    }
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
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
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
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Manage orders and user approvals</p>
        </motion.div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="shadow-lg border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Pending Orders</p>
                  <p className="text-3xl font-bold text-blue-600">{pendingOrders.length}</p>
                </div>
                <ShoppingCart className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-lg border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Pending Users</p>
                  <p className="text-3xl font-bold text-orange-600">{pendingUsers?.length || 0}</p>
                </div>
                <Users className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-lg border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Total Orders</p>
                  <p className="text-3xl font-bold text-green-600">{orders?.length || 0}</p>
                </div>
                <Package className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-lg border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Revenue</p>
                  <p className="text-3xl font-bold text-purple-600">
                    {formatPrice(orders?.reduce((sum, order) => sum + Number(order.totalAmount), 0) || 0)}
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Pending Orders Section */}
        <Card className="shadow-xl border-0 bg-white mb-8">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg">
            <CardTitle className="text-2xl font-bold flex items-center gap-3">
              <ShoppingCart className="h-6 w-6" />
              Pending Orders with Bank Details ({pendingOrders.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {ordersLoading ? (
              <div className="text-center py-8">
                <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-gray-600">Loading orders...</p>
              </div>
            ) : pendingOrders.length === 0 ? (
              <div className="text-center py-8">
                <ShoppingCart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No pending orders</p>
              </div>
            ) : (
              <div className="space-y-6">
                {pendingOrders.map((order) => (
                  <motion.div
                    key={order.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="border border-gray-200 rounded-lg p-6 bg-gray-50"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">Order #{order.orderNumber}</h3>
                        <div className="flex items-center gap-4 mt-2">
                          <Badge className={`${getStatusColor(order.status)} border-0`}>
                            {order.status.replace('_', ' ').toUpperCase()}
                          </Badge>
                          <span className="text-gray-600 flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {formatDate(order.createdAt)}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-blue-600">{formatPrice(order.totalAmount)}</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      {/* Shipping Info */}
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          Shipping Address
                        </h4>
                        <div className="bg-white p-4 rounded border">
                          <p className="font-medium">{order.shippingAddress?.fullName}</p>
                          <p>{order.shippingAddress?.address}</p>
                          <p>{order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.zipCode}</p>
                          <p>{order.shippingAddress?.country}</p>
                        </div>
                      </div>

                      {/* Bank Details */}
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                          <CreditCard className="h-4 w-4" />
                          Bank Account Details
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => toggleBankDetails(order.id)}
                            className="ml-auto h-7 text-xs"
                          >
                            {visibleBankDetails[order.id] ? (
                              <>
                                <EyeOff className="h-3 w-3 mr-1" />
                                Hide
                              </>
                            ) : (
                              <>
                                <Eye className="h-3 w-3 mr-1" />
                                Show
                              </>
                            )}
                          </Button>
                        </h4>
                        
                        {order.bankDetails ? (
                          <div className="bg-red-50 border-2 border-red-200 p-4 rounded">
                            <div className="text-red-600 mb-3 text-xs font-medium uppercase tracking-wide">
                              ⚠️ Confidential Banking Information
                            </div>
                            
                            {visibleBankDetails[order.id] ? (
                              <div className="space-y-2 text-sm">
                                <p><strong>Account Holder:</strong> {order.bankDetails.accountHolderName}</p>
                                <p><strong>Bank Name:</strong> {order.bankDetails.bankName}</p>
                                <p><strong>Account Number:</strong> {order.bankDetails.accountNumber}</p>
                                <p><strong>Routing Number:</strong> {order.bankDetails.routingNumber}</p>
                                <p><strong>Account Type:</strong> {order.bankDetails.accountType.toUpperCase()}</p>
                              </div>
                            ) : (
                              <div className="space-y-2 text-sm text-gray-500">
                                <p><strong>Account Holder:</strong> ••••••••••••••••</p>
                                <p><strong>Bank Name:</strong> ••••••••••••••••</p>
                                <p><strong>Account Number:</strong> ••••••••••••••••</p>
                                <p><strong>Routing Number:</strong> ••••••••••••••••</p>
                                <p><strong>Account Type:</strong> ••••••••••••••••</p>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="bg-white p-4 rounded border">
                            <p className="text-gray-500 text-sm">No bank details provided</p>
                          </div>
                        )}
                      </div>
                    </div>

                    <Separator className="my-4" />

                    {/* Action Buttons */}
                    <div className="flex justify-between">
                      <Button
                        variant="outline"
                        onClick={() => contactCustomerMutation.mutate(order.id)}
                        disabled={contactCustomerMutation.isPending}
                        className="text-blue-600 border-blue-300 hover:bg-blue-50"
                      >
                        <Users className="h-4 w-4 mr-2" />
                        Contact Customer
                      </Button>
                      
                      <div className="flex space-x-3">
                        <Button
                          variant="outline"
                          onClick={() => rejectOrderMutation.mutate(order.id)}
                          disabled={rejectOrderMutation.isPending}
                          className="text-red-600 border-red-300 hover:bg-red-50"
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          Cancel & Remove Order
                        </Button>
                        <Button
                          onClick={() => approveOrderMutation.mutate(order.id)}
                          disabled={approveOrderMutation.isPending}
                          className="bg-green-600 hover:bg-green-700 text-white"
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Approve Order
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link href="/admin/products">
            <Button className="w-full h-16 bg-blue-600 hover:bg-blue-700 text-white text-lg">
              <Package className="h-6 w-6 mr-3" />
              Manage Products
            </Button>
          </Link>
          
          <Link href="/admin/orders">
            <Button className="w-full h-16 bg-green-600 hover:bg-green-700 text-white text-lg">
              <ShoppingCart className="h-6 w-6 mr-3" />
              View All Orders
            </Button>
          </Link>
          
          <Button className="w-full h-16 bg-purple-600 hover:bg-purple-700 text-white text-lg">
            <Users className="h-6 w-6 mr-3" />
            User Management
          </Button>
        </div>

        {/* User Approvals Section */}
        <div className="space-y-6">
          <motion.h2
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-2xl font-bold text-gray-900"
          >
            User Approvals
          </motion.h2>

          {pendingUsers && pendingUsers.length > 0 ? (
            <div className="space-y-4">
              {pendingUsers.map((user, index) => (
                <motion.div
                  key={user.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 * index }}
                >
                  <Card className="shadow-lg border-0 bg-white hover:shadow-xl transition-shadow duration-300">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                              <Users className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-900">{user.fullName}</h3>
                              <p className="text-sm text-gray-600">{user.email}</p>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="font-medium text-gray-700">License: </span>
                              <span className="text-gray-600">{user.licenseNumber}</span>
                            </div>
                            <div>
                              <span className="font-medium text-gray-700">College: </span>
                              <span className="text-gray-600">{user.collegeName}</span>
                            </div>
                            <div>
                              <span className="font-medium text-gray-700">Province/State: </span>
                              <span className="text-gray-600">{user.provinceState}</span>
                            </div>
                            <div>
                              <span className="font-medium text-gray-700">Practice: </span>
                              <span className="text-gray-600">{user.practiceName}</span>
                            </div>
                          </div>

                          <div className="mt-3">
                            <span className="font-medium text-gray-700">Address: </span>
                            <span className="text-gray-600">{user.practiceAddress}</span>
                          </div>
                        </div>

                        <div className="flex space-x-3 ml-6">
                          <Button
                            variant="outline"
                            onClick={() => rejectUserMutation.mutate(user.id)}
                            disabled={rejectUserMutation.isPending}
                            className="text-red-600 border-red-300 hover:bg-red-50"
                          >
                            <XCircle className="h-4 w-4 mr-2" />
                            Reject
                          </Button>
                          <Button
                            onClick={() => approveUserMutation.mutate(user.id)}
                            disabled={approveUserMutation.isPending}
                            className="bg-green-600 hover:bg-green-700 text-white"
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Approve
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          ) : (
            <Card className="shadow-lg border-0 bg-white">
              <CardContent className="p-8 text-center">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No pending user approvals</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Customer Contact Modal */}
        {customerContact && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={() => setCustomerContact(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-lg p-6 max-w-md w-full mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Contact Information</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-600">Order Number:</label>
                  <p className="text-gray-900">{customerContact.orderNumber}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Customer Email:</label>
                  <p className="text-blue-600 font-medium">{customerContact.email}</p>
                </div>
                <div className="flex space-x-3 mt-6">
                  <Button
                    onClick={() => {
                      window.open(`mailto:${customerContact.email}?subject=Regarding Order ${customerContact.orderNumber}`, '_blank');
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white flex-1"
                  >
                    Send Email
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      navigator.clipboard.writeText(customerContact.email);
                      toast({
                        title: "Copied!",
                        description: "Email address copied to clipboard",
                      });
                    }}
                  >
                    Copy Email
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setCustomerContact(null)}
                  >
                    Close
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  );
}