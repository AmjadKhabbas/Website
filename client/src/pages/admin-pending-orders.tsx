import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { 
  CheckCircle, 
  XCircle, 
  Eye, 
  Mail, 
  Phone, 
  MapPin, 
  Building, 
  CreditCard, 
  DollarSign,
  Clock,
  User,
  Package,
  Copy
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { formatPrice } from "@/lib/utils";

interface Order {
  id: number;
  orderNumber: string;
  status: string;
  totalAmount: string;
  doctorName: string;
  doctorEmail: string;
  doctorPhone: string;
  institutionNumber: string;
  shippingAddress: any;
  billingAddress: any;
  doctorBankingInfo: any;
  cardInfo: any;
  paymentMethod: string;
  notes: string;
  createdAt: string;
  items: Array<{
    id: number;
    productName: string;
    productImageUrl: string;
    quantity: number;
    unitPrice: string;
    totalPrice: string;
  }>;
}

export default function AdminPendingOrdersPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [declineReason, setDeclineReason] = useState("");

  // Fetch pending orders
  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["/api/admin/pending-orders"],
    queryFn: async () => {
      const response = await fetch("/api/admin/pending-orders");
      if (!response.ok) {
        throw new Error("Failed to fetch pending orders");
      }
      return response.json();
    },
  });

  // Approve order mutation
  const approveOrderMutation = useMutation({
    mutationFn: async (orderId: number) => {
      const response = await fetch(`/api/admin/orders/${orderId}/approve`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) {
        throw new Error("Failed to approve order");
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Order Approved",
        description: "The order has been approved and the doctor will be notified.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/pending-orders"] });
      setSelectedOrder(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to approve order",
        variant: "destructive",
      });
    },
  });

  // Decline order mutation
  const declineOrderMutation = useMutation({
    mutationFn: async ({ orderId, reason }: { orderId: number; reason: string }) => {
      const response = await fetch(`/api/admin/orders/${orderId}/decline`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ reason }),
      });
      if (!response.ok) {
        throw new Error("Failed to decline order");
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Order Declined",
        description: "The order has been declined and the doctor will be notified.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/pending-orders"] });
      setSelectedOrder(null);
      setDeclineReason("");
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to decline order",
        variant: "destructive",
      });
    },
  });

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: "Text copied to clipboard",
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case "approved":
        return <Badge variant="secondary" className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Approved</Badge>;
      case "declined":
        return <Badge variant="secondary" className="bg-red-100 text-red-800"><XCircle className="w-3 h-3 mr-1" />Declined</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Pending Orders</h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse space-y-4">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Pending Orders</h1>
          <p className="text-gray-600 text-sm mt-1">Review and manage doctor orders requiring approval</p>
        </div>
        <Badge variant="secondary" className="text-lg px-3 py-1">
          {Array.isArray(orders) ? orders.filter((order: Order) => order.status === "pending").length : 0} Pending
        </Badge>
      </div>

      {!Array.isArray(orders) || orders.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Package className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No pending orders</h3>
            <p className="text-gray-600">All orders have been processed or no new orders have been submitted.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.isArray(orders) && orders.map((order: Order) => (
            <Card key={order.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">#{order.orderNumber}</CardTitle>
                  {getStatusBadge(order.status)}
                </div>
                <CardDescription className="flex items-center space-x-2">
                  <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                  <span>•</span>
                  <span className="font-semibold text-blue-600">{formatPrice(order.totalAmount)}</span>
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-sm">
                    <User className="w-4 h-4 text-gray-500" />
                    <span className="font-medium">{order.doctorName}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Mail className="w-4 h-4" />
                    <span>{order.doctorEmail}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={() => copyToClipboard(order.doctorEmail)}
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Building className="w-4 h-4" />
                    <span>Institution: {order.institutionNumber}</span>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-900">Order Items ({order.items.length})</p>
                  <div className="space-y-1">
                    {order.items.slice(0, 2).map((item) => (
                      <div key={item.id} className="flex justify-between text-xs text-gray-600">
                        <span className="truncate">{item.productName}</span>
                        <span>×{item.quantity}</span>
                      </div>
                    ))}
                    {order.items.length > 2 && (
                      <p className="text-xs text-gray-500">+{order.items.length - 2} more items</p>
                    )}
                  </div>
                </div>

                <div className="flex space-x-2 pt-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => setSelectedOrder(order)}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View Details
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle className="flex items-center justify-between">
                          <span>Order Details - #{order.orderNumber}</span>
                          <div className="flex items-center space-x-2 text-sm font-normal text-gray-600">
                            <Clock className="w-4 h-4" />
                            <span>
                              {new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString()}
                            </span>
                          </div>
                        </DialogTitle>
                        <DialogDescription>
                          Complete order information and doctor details
                        </DialogDescription>
                      </DialogHeader>
                      
                      {selectedOrder && (
                        <div className="space-y-6">
                          {/* Doctor Information */}
                          <Card>
                            <CardHeader>
                              <CardTitle className="text-lg flex items-center space-x-2">
                                <User className="w-5 h-5 text-blue-600" />
                                <span>Doctor Information</span>
                              </CardTitle>
                            </CardHeader>
                            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <Label className="text-sm font-medium text-gray-700">Full Name</Label>
                                <div className="flex items-center space-x-2">
                                  <Input value={selectedOrder.doctorName} readOnly className="bg-gray-50" />
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => copyToClipboard(selectedOrder.doctorName)}
                                  >
                                    <Copy className="w-4 h-4" />
                                  </Button>
                                </div>
                              </div>
                              <div>
                                <Label className="text-sm font-medium text-gray-700">Email</Label>
                                <div className="flex items-center space-x-2">
                                  <Input value={selectedOrder.doctorEmail} readOnly className="bg-gray-50" />
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => copyToClipboard(selectedOrder.doctorEmail)}
                                  >
                                    <Copy className="w-4 h-4" />
                                  </Button>
                                </div>
                              </div>
                              <div>
                                <Label className="text-sm font-medium text-gray-700">Phone</Label>
                                <div className="flex items-center space-x-2">
                                  <Input value={selectedOrder.doctorPhone || "Not provided"} readOnly className="bg-gray-50" />
                                  {selectedOrder.doctorPhone && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => copyToClipboard(selectedOrder.doctorPhone)}
                                    >
                                      <Copy className="w-4 h-4" />
                                    </Button>
                                  )}
                                </div>
                              </div>
                              <div>
                                <Label className="text-sm font-medium text-gray-700">Institution Number</Label>
                                <div className="flex items-center space-x-2">
                                  <Input value={selectedOrder.institutionNumber} readOnly className="bg-gray-50" />
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => copyToClipboard(selectedOrder.institutionNumber)}
                                  >
                                    <Copy className="w-4 h-4" />
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>

                          {/* Addresses */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Card>
                              <CardHeader>
                                <CardTitle className="text-lg flex items-center space-x-2">
                                  <MapPin className="w-5 h-5 text-blue-600" />
                                  <span>Shipping Address</span>
                                </CardTitle>
                              </CardHeader>
                              <CardContent>
                                <div className="space-y-2 text-sm">
                                  <p>{selectedOrder.shippingAddress.clinicName}</p>
                                  <p>{selectedOrder.shippingAddress.street}</p>
                                  <p>{selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} {selectedOrder.shippingAddress.zipCode}</p>
                                  <p>{selectedOrder.shippingAddress.country}</p>
                                </div>
                              </CardContent>
                            </Card>

                            <Card>
                              <CardHeader>
                                <CardTitle className="text-lg flex items-center space-x-2">
                                  <Building className="w-5 h-5 text-blue-600" />
                                  <span>Billing Address</span>
                                </CardTitle>
                              </CardHeader>
                              <CardContent>
                                <div className="space-y-2 text-sm">
                                  <p>{selectedOrder.billingAddress.street}</p>
                                  <p>{selectedOrder.billingAddress.city}, {selectedOrder.billingAddress.state} {selectedOrder.billingAddress.zipCode}</p>
                                  <p>{selectedOrder.billingAddress.country}</p>
                                </div>
                              </CardContent>
                            </Card>
                          </div>

                          {/* Banking & Payment Information - Admin Only */}
                          <Card className="border-red-200 bg-red-50">
                            <CardHeader>
                              <CardTitle className="text-lg flex items-center space-x-2 text-red-700">
                                <CreditCard className="w-5 h-5" />
                                <span>Sensitive Payment Information (Admin Only)</span>
                              </CardTitle>
                              <CardDescription className="text-red-600">
                                This information is only visible to admin users for order processing
                              </CardDescription>
                            </CardHeader>
                          </Card>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Card>
                              <CardHeader>
                                <CardTitle className="text-lg flex items-center space-x-2">
                                  <Building className="w-5 h-5 text-green-600" />
                                  <span>Banking Information</span>
                                </CardTitle>
                              </CardHeader>
                              <CardContent className="space-y-3">
                                <div>
                                  <Label className="text-sm font-medium text-gray-700">Bank Name</Label>
                                  <Input value={selectedOrder.doctorBankingInfo.bankName} readOnly className="bg-gray-50" />
                                </div>
                                <div>
                                  <Label className="text-sm font-medium text-gray-700">Account Number</Label>
                                  <div className="flex items-center space-x-2">
                                    <Input value={`****${selectedOrder.doctorBankingInfo.accountNumber.slice(-4)}`} readOnly className="bg-gray-50" />
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => copyToClipboard(selectedOrder.doctorBankingInfo.accountNumber)}
                                    >
                                      <Copy className="w-4 h-4" />
                                    </Button>
                                  </div>
                                </div>
                                <div>
                                  <Label className="text-sm font-medium text-gray-700">Routing Number</Label>
                                  <div className="flex items-center space-x-2">
                                    <Input value={selectedOrder.doctorBankingInfo.routingNumber} readOnly className="bg-gray-50" />
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => copyToClipboard(selectedOrder.doctorBankingInfo.routingNumber)}
                                    >
                                      <Copy className="w-4 h-4" />
                                    </Button>
                                  </div>
                                </div>
                                <div>
                                  <Label className="text-sm font-medium text-gray-700">Account Type</Label>
                                  <Input value={selectedOrder.doctorBankingInfo.accountType} readOnly className="bg-gray-50" />
                                </div>
                              </CardContent>
                            </Card>

                            <Card className="border-purple-200">
                              <CardHeader>
                                <CardTitle className="text-lg flex items-center space-x-2">
                                  <CreditCard className="w-5 h-5 text-purple-600" />
                                  <span>Card Information</span>
                                </CardTitle>
                              </CardHeader>
                              <CardContent className="space-y-3">
                                <div>
                                  <Label className="text-sm font-medium text-gray-700">Card Type</Label>
                                  <Input value={selectedOrder.cardInfo.cardType || "Unknown"} readOnly className="bg-purple-50" />
                                </div>
                                <div>
                                  <Label className="text-sm font-medium text-gray-700">Full Card Number (Admin Only)</Label>
                                  <div className="flex items-center space-x-2">
                                    <Input value={selectedOrder.cardInfo.cardNumber || `****-****-****-${selectedOrder.cardInfo.last4}`} readOnly className="bg-purple-50" />
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => copyToClipboard(selectedOrder.cardInfo.cardNumber || selectedOrder.cardInfo.last4)}
                                    >
                                      <Copy className="w-4 h-4" />
                                    </Button>
                                  </div>
                                </div>
                                <div>
                                  <Label className="text-sm font-medium text-gray-700">Cardholder Name</Label>
                                  <div className="flex items-center space-x-2">
                                    <Input value={selectedOrder.cardInfo.cardholderName || "Not provided"} readOnly className="bg-purple-50" />
                                    {selectedOrder.cardInfo.cardholderName && (
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => copyToClipboard(selectedOrder.cardInfo.cardholderName)}
                                      >
                                        <Copy className="w-4 h-4" />
                                      </Button>
                                    )}
                                  </div>
                                </div>
                                <div>
                                  <Label className="text-sm font-medium text-gray-700">CVV</Label>
                                  <div className="flex items-center space-x-2">
                                    <Input value={selectedOrder.cardInfo.cvv || "***"} readOnly className="bg-purple-50" />
                                    {selectedOrder.cardInfo.cvv && (
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => copyToClipboard(selectedOrder.cardInfo.cvv)}
                                      >
                                        <Copy className="w-4 h-4" />
                                      </Button>
                                    )}
                                  </div>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                  <div>
                                    <Label className="text-sm font-medium text-gray-700">Expiry Month</Label>
                                    <Input value={selectedOrder.cardInfo.expiryMonth.padStart(2, '0')} readOnly className="bg-purple-50" />
                                  </div>
                                  <div>
                                    <Label className="text-sm font-medium text-gray-700">Expiry Year</Label>
                                    <Input value={selectedOrder.cardInfo.expiryYear} readOnly className="bg-purple-50" />
                                  </div>
                                </div>
                                <div>
                                  <Label className="text-sm font-medium text-gray-700">Transaction Date</Label>
                                  <Input value={new Date(selectedOrder.createdAt).toLocaleString()} readOnly className="bg-purple-50" />
                                </div>
                              </CardContent>
                            </Card>
                          </div>

                          {/* Order Items */}
                          <Card>
                            <CardHeader>
                              <CardTitle className="text-lg flex items-center space-x-2">
                                <Package className="w-5 h-5 text-blue-600" />
                                <span>Order Items</span>
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-3">
                                {selectedOrder.items.map((item) => (
                                  <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                                    <div className="flex items-center space-x-3">
                                      {item.productImageUrl && (
                                        <img
                                          src={item.productImageUrl}
                                          alt={item.productName}
                                          className="w-12 h-12 object-cover rounded"
                                        />
                                      )}
                                      <div>
                                        <p className="font-medium">{item.productName}</p>
                                        <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                                      </div>
                                    </div>
                                    <div className="text-right">
                                      <p className="font-medium">{formatPrice(item.totalPrice)}</p>
                                      <p className="text-sm text-gray-600">{formatPrice(item.unitPrice)} each</p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                              <Separator className="my-4" />
                              <div className="flex justify-between items-center text-lg font-bold">
                                <span>Total Amount</span>
                                <span className="text-blue-600">{formatPrice(selectedOrder.totalAmount)}</span>
                              </div>
                            </CardContent>
                          </Card>

                          {/* Notes */}
                          {selectedOrder.notes && (
                            <Card>
                              <CardHeader>
                                <CardTitle className="text-lg">Additional Notes</CardTitle>
                              </CardHeader>
                              <CardContent>
                                <p className="text-gray-700">{selectedOrder.notes}</p>
                              </CardContent>
                            </Card>
                          )}

                          {/* Action Buttons */}
                          {selectedOrder.status === "pending" && (
                            <div className="flex space-x-4 pt-4">
                              <Button
                                onClick={() => approveOrderMutation.mutate(selectedOrder.id)}
                                disabled={approveOrderMutation.isPending}
                                className="flex-1 bg-green-600 hover:bg-green-700"
                              >
                                <CheckCircle className="w-4 h-4 mr-2" />
                                {approveOrderMutation.isPending ? "Approving..." : "Approve Order"}
                              </Button>
                              
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="destructive" className="flex-1">
                                    <XCircle className="w-4 h-4 mr-2" />
                                    Decline Order
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Decline Order</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Please provide a reason for declining this order. The doctor will be notified via email.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <Textarea
                                    value={declineReason}
                                    onChange={(e) => setDeclineReason(e.target.value)}
                                    placeholder="Reason for declining (e.g., license verification required, missing documentation, etc.)"
                                    className="min-h-[100px]"
                                  />
                                  <AlertDialogFooter>
                                    <AlertDialogCancel onClick={() => setDeclineReason("")}>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => declineOrderMutation.mutate({ orderId: selectedOrder.id, reason: declineReason })}
                                      disabled={!declineReason.trim() || declineOrderMutation.isPending}
                                      className="bg-red-600 hover:bg-red-700"
                                    >
                                      {declineOrderMutation.isPending ? "Declining..." : "Decline Order"}
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          )}
                        </div>
                      )}
                    </DialogContent>
                  </Dialog>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}