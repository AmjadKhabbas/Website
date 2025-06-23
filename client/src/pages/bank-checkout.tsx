import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, ShoppingCart, Lock, CreditCard, CheckCircle } from 'lucide-react';
import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCartStore } from '@/lib/cart';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

interface ShippingInfo {
  fullName: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

interface BankInfo {
  accountHolderName: string;
  bankName: string;
  accountNumber: string;
  routingNumber: string;
  accountType: 'checking' | 'savings';
}

interface BillingAddress {
  fullName: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export default function BankCheckoutPage() {
  const [, setLocation] = useLocation();
  const { items, getTotalPrice, getItemTotalPrice, clearCart } = useCartStore();
  const { user, admin } = useAuth();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');
  const [useSavedInfo, setUseSavedInfo] = useState(true);

  const currentUser = user || admin;

  const [shippingInfo, setShippingInfo] = useState<ShippingInfo>({
    fullName: currentUser?.fullName || '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'US'
  });

  const [billingAddress, setBillingAddress] = useState<BillingAddress>({
    fullName: currentUser?.fullName || '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'US'
  });

  const [bankInfo, setBankInfo] = useState<BankInfo>({
    accountHolderName: currentUser?.fullName || '',
    bankName: '',
    accountNumber: '',
    routingNumber: '',
    accountType: 'checking'
  });

  // Load saved information if available
  useEffect(() => {
    if (currentUser && 'savedBillingAddress' in currentUser && currentUser.savedBillingAddress) {
      setBillingAddress(currentUser.savedBillingAddress as BillingAddress);
    }
  }, [currentUser]);
  const totalAmount = getTotalPrice();

  const handleShippingChange = (field: keyof ShippingInfo, value: string) => {
    setShippingInfo(prev => ({ ...prev, [field]: value }));
  };

  const handleBankChange = (field: keyof BankInfo, value: string) => {
    setBankInfo(prev => ({ ...prev, [field]: value }));
  };

  const handleBillingAddressChange = (field: keyof BillingAddress, value: string) => {
    setBillingAddress(prev => ({ ...prev, [field]: value }));
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate shipping information
    const requiredShippingFields = ['fullName', 'address', 'city', 'state', 'zipCode'];
    const missingShippingFields = requiredShippingFields.filter(field => !shippingInfo[field as keyof ShippingInfo]);
    
    if (missingShippingFields.length > 0) {
      toast({
        title: "Missing Information",
        description: "Please fill in all shipping details.",
        variant: "destructive",
      });
      return;
    }

    // Validate billing address
    const requiredBillingFields = ['fullName', 'address', 'city', 'state', 'zipCode'];
    const missingBillingFields = requiredBillingFields.filter(field => !billingAddress[field as keyof BillingAddress]);
    
    if (missingBillingFields.length > 0) {
      toast({
        title: "Missing Billing Information",
        description: "Please fill in all billing address details.",
        variant: "destructive",
      });
      return;
    }

    // Validate bank information
    const requiredBankFields = ['accountHolderName', 'bankName', 'accountNumber', 'routingNumber'];
    const missingBankFields = requiredBankFields.filter(field => !bankInfo[field as keyof BankInfo]);
    
    if (missingBankFields.length > 0) {
      toast({
        title: "Missing Bank Information",
        description: "Please fill in all bank account details.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    try {
      // Create order with bank details
      const response = await apiRequest('POST', '/api/orders/bank-payment', {
        items: items.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          price: getItemTotalPrice(item) / item.quantity
        })),
        shippingAddress: shippingInfo,
        billingAddress: billingAddress,
        totalAmount: totalAmount,
        bankDetails: bankInfo,
        saveBillingInfo: !useSavedInfo // Save if using new info
      });

      const data = await response.json();
      
      if (response.ok) {
        clearCart();
        setOrderNumber(data.order.orderNumber);
        setOrderComplete(true);
        toast({
          title: "Order Submitted Successfully",
          description: "Your order is pending manual processing. You will be contacted for payment confirmation.",
        });
      } else {
        throw new Error(data.message || 'Failed to create order');
      }
    } catch (error: any) {
      toast({
        title: "Order Failed",
        description: error.message || "Failed to process your order. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen pt-16 bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <ShoppingCart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Your cart is empty</h1>
          <p className="text-gray-600 mb-6">Add some products to proceed with checkout.</p>
          <Link href="/">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
              Continue Shopping
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  if (orderComplete) {
    return (
      <div className="min-h-screen pt-16 bg-gradient-to-br from-green-50 to-blue-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="text-center mb-8"
          >
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
            
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Order Submitted!</h1>
            <p className="text-xl text-gray-600 mb-4">Order Number: {orderNumber}</p>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Your order has been submitted for manual processing. Our team will review your bank details and contact you within 1-2 business days to confirm payment and process your order.
            </p>
          </motion.div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/orders">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3">
                View Order History
              </Button>
            </Link>
            <Link href="/">
              <Button variant="outline" className="border-blue-200 text-blue-600 hover:bg-blue-50 px-8 py-3">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Continue Shopping
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-16 bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm py-4 border-b border-blue-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href="/">
            <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-800 hover:bg-blue-100">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Shopping
            </Button>
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Order Summary */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Card className="shadow-xl border-0 bg-white">
              <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg">
                <CardTitle className="text-2xl font-bold flex items-center gap-3">
                  <ShoppingCart className="h-6 w-6" />
                  Order Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {items.map((item) => {
                    const itemTotal = getItemTotalPrice(item);
                    const unitPrice = itemTotal / item.quantity;
                    const originalPrice = parseFloat(item.product.price);
                    const hasDiscount = unitPrice < originalPrice;

                    return (
                      <div key={item.id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                        <img
                          src={item.product.imageUrl}
                          alt={item.product.name}
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">{item.product.name}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-sm text-gray-600">Qty: {item.quantity}</span>
                            {hasDiscount && (
                              <Badge className="bg-green-100 text-green-800 text-xs">
                                Bulk Discount
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="font-bold text-blue-600">
                              {formatPrice(unitPrice)}
                            </span>
                            {hasDiscount && (
                              <span className="text-sm text-gray-500 line-through">
                                {formatPrice(originalPrice)}
                              </span>
                            )}
                            <span className="text-sm text-gray-600">each</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-lg font-bold text-gray-900">
                            {formatPrice(itemTotal)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <Separator className="my-6" />

                <div className="space-y-2">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span className="text-blue-600">{formatPrice(totalAmount)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Payment Form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Shipping Information */}
              <Card className="shadow-xl border-0 bg-white">
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-gray-900">
                    Shipping Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input
                      id="fullName"
                      value={shippingInfo.fullName}
                      onChange={(e) => handleShippingChange('fullName', e.target.value)}
                      placeholder="Enter your full name"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="address">Address</Label>
                    <Input
                      id="address"
                      value={shippingInfo.address}
                      onChange={(e) => handleShippingChange('address', e.target.value)}
                      placeholder="Enter your address"
                      required
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        value={shippingInfo.city}
                        onChange={(e) => handleShippingChange('city', e.target.value)}
                        placeholder="City"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="state">State</Label>
                      <Input
                        id="state"
                        value={shippingInfo.state}
                        onChange={(e) => handleShippingChange('state', e.target.value)}
                        placeholder="State"
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="zipCode">ZIP Code</Label>
                    <Input
                      id="zipCode"
                      value={shippingInfo.zipCode}
                      onChange={(e) => handleShippingChange('zipCode', e.target.value)}
                      placeholder="ZIP Code"
                      required
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Billing Address */}
              <Card className="shadow-xl border-0 bg-white">
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-gray-900">
                    Billing Address
                  </CardTitle>
                  {currentUser && 'savedBillingAddress' in currentUser && currentUser.savedBillingAddress && (
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="useSavedInfo"
                        checked={useSavedInfo}
                        onChange={(e) => setUseSavedInfo(e.target.checked)}
                        className="rounded"
                      />
                      <Label htmlFor="useSavedInfo" className="text-sm">
                        Use saved billing information
                      </Label>
                    </div>
                  )}
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="billingFullName">Full Name</Label>
                    <Input
                      id="billingFullName"
                      value={billingAddress.fullName}
                      onChange={(e) => handleBillingAddressChange('fullName', e.target.value)}
                      placeholder="Enter billing name"
                      disabled={useSavedInfo && currentUser && 'savedBillingAddress' in currentUser && currentUser.savedBillingAddress}
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="billingAddress">Address</Label>
                    <Input
                      id="billingAddress"
                      value={billingAddress.address}
                      onChange={(e) => handleBillingAddressChange('address', e.target.value)}
                      placeholder="Enter billing address"
                      disabled={useSavedInfo && currentUser && 'savedBillingAddress' in currentUser && currentUser.savedBillingAddress}
                      required
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="billingCity">City</Label>
                      <Input
                        id="billingCity"
                        value={billingAddress.city}
                        onChange={(e) => handleBillingAddressChange('city', e.target.value)}
                        placeholder="City"
                        disabled={useSavedInfo && currentUser && 'savedBillingAddress' in currentUser && currentUser.savedBillingAddress}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="billingState">State</Label>
                      <Input
                        id="billingState"
                        value={billingAddress.state}
                        onChange={(e) => handleBillingAddressChange('state', e.target.value)}
                        placeholder="State"
                        disabled={useSavedInfo && currentUser && 'savedBillingAddress' in currentUser && currentUser.savedBillingAddress}
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="billingZipCode">ZIP Code</Label>
                    <Input
                      id="billingZipCode"
                      value={billingAddress.zipCode}
                      onChange={(e) => handleBillingAddressChange('zipCode', e.target.value)}
                      placeholder="ZIP Code"
                      disabled={useSavedInfo && currentUser && 'savedBillingAddress' in currentUser && currentUser.savedBillingAddress}
                      required
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Bank Information */}
              <Card className="shadow-xl border-0 bg-white">
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Bank Account Information
                  </CardTitle>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Lock className="h-4 w-4" />
                    <span>Securely encrypted and stored for manual processing</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="accountHolderName">Account Holder Name</Label>
                    <Input
                      id="accountHolderName"
                      value={bankInfo.accountHolderName}
                      onChange={(e) => handleBankChange('accountHolderName', e.target.value)}
                      placeholder="Full name on account"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="bankName">Bank Name</Label>
                    <Input
                      id="bankName"
                      value={bankInfo.bankName}
                      onChange={(e) => handleBankChange('bankName', e.target.value)}
                      placeholder="Name of your bank"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="accountNumber">Account Number</Label>
                    <Input
                      id="accountNumber"
                      type="password"
                      value={bankInfo.accountNumber}
                      onChange={(e) => handleBankChange('accountNumber', e.target.value)}
                      placeholder="Your account number"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="routingNumber">Routing Number</Label>
                    <Input
                      id="routingNumber"
                      value={bankInfo.routingNumber}
                      onChange={(e) => handleBankChange('routingNumber', e.target.value)}
                      placeholder="9-digit routing number"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="accountType">Account Type</Label>
                    <Select value={bankInfo.accountType} onValueChange={(value: 'checking' | 'savings') => handleBankChange('accountType', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select account type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="checking">Checking</SelectItem>
                        <SelectItem value="savings">Savings</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isProcessing}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-4 text-lg"
              >
                {isProcessing ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Submitting Order...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center space-x-2">
                    <Lock className="w-5 h-5" />
                    <span>Submit Order for Processing</span>
                  </div>
                )}
              </Button>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
}