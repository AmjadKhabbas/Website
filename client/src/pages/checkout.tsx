import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, CreditCard, MapPin, Building, Phone, Mail, User, DollarSign } from "lucide-react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { useCart } from "@/lib/cart";
import type { ProductWithCategory } from "@shared/schema";

// Validation schema for checkout form
const checkoutSchema = z.object({
  // Doctor Information
  doctorName: z.string().min(2, "Doctor name is required"),
  doctorEmail: z.string().email("Valid email is required"),
  doctorPhone: z.string().min(10, "Valid phone number is required"),
  
  // Institution Information
  institutionNumber: z.string().min(3, "Institution number is required"),
  clinicName: z.string().min(2, "Clinic name is required"),
  
  // Billing Address
  billingAddress: z.object({
    street: z.string().min(5, "Street address is required"),
    city: z.string().min(2, "City is required"),
    state: z.string().min(2, "State is required"),
    zipCode: z.string().min(5, "Valid ZIP code is required"),
    country: z.string().default("United States"),
  }),
  
  // Shipping Address
  shippingAddress: z.object({
    street: z.string().min(5, "Street address is required"),
    city: z.string().min(2, "City is required"),
    state: z.string().min(2, "State is required"),
    zipCode: z.string().min(5, "Valid ZIP code is required"),
    country: z.string().default("United States"),
  }),
  
  // Banking Information
  bankingInfo: z.object({
    bankName: z.string().min(2, "Bank name is required"),
    accountNumber: z.string().min(8, "Valid account number is required"),
    routingNumber: z.string().min(9, "Valid routing number is required"),
    accountType: z.enum(["checking", "savings"], {
      required_error: "Please select an account type",
    }),
  }),
  
  // Card Information
  cardInfo: z.object({
    cardNumber: z.string().min(16, "Valid card number is required"),
    expiryMonth: z.string().min(2, "Expiry month is required"),
    expiryYear: z.string().min(4, "Expiry year is required"),
    cvv: z.string().min(3, "CVV is required"),
    cardholderName: z.string().min(2, "Cardholder name is required"),
  }),
  
  // Additional Information
  paymentMethod: z.string().default("credit_card"),
  notes: z.string().optional(),
  sameAsShipping: z.boolean().default(true),
});

type CheckoutFormData = z.infer<typeof checkoutSchema>;

export default function CheckoutPage() {
  const { items, total, clearCart } = useCart();
  const { toast } = useToast();
  const [location, navigate] = useLocation();
  const [sameAsShipping, setSameAsShipping] = useState(true);
  const [directProduct, setDirectProduct] = useState<{id: number, quantity: number} | null>(null);

  // Parse URL parameters for direct product purchase
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('product');
    const quantity = urlParams.get('quantity');
    
    if (productId && quantity) {
      setDirectProduct({
        id: parseInt(productId),
        quantity: parseInt(quantity)
      });
    }
  }, [location]);

  // Fetch product details for direct purchase
  const { data: productDetails } = useQuery<ProductWithCategory>({
    queryKey: ['/api/products', directProduct?.id],
    queryFn: async () => {
      const response = await fetch(`/api/products/${directProduct!.id}`);
      if (!response.ok) throw new Error('Failed to fetch product');
      return response.json();
    },
    enabled: !!directProduct?.id,
  });

  // Calculate items and total based on cart or direct purchase
  const checkoutItems = directProduct && productDetails 
    ? [{
        product: productDetails,
        quantity: directProduct.quantity,
        price: parseFloat(productDetails.price)
      }]
    : items;

  const checkoutTotal = directProduct && productDetails
    ? parseFloat(productDetails.price) * directProduct.quantity
    : total;

  const form = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      billingAddress: {
        country: "United States",
      },
      shippingAddress: {
        country: "United States",
      },
      paymentMethod: "credit_card",
      sameAsShipping: true,
    },
  });

  const createOrderMutation = useMutation({
    mutationFn: async (data: CheckoutFormData) => {
      // Process card info - store only last 4 digits and non-sensitive data
      const cardInfo = {
        last4: data.cardInfo.cardNumber.slice(-4),
        expiryMonth: data.cardInfo.expiryMonth,
        expiryYear: data.cardInfo.expiryYear,
        cardType: getCardType(data.cardInfo.cardNumber),
      };

      const orderData = {
        items: checkoutItems,
        totalAmount: checkoutTotal.toString(),
        doctorName: data.doctorName,
        doctorEmail: data.doctorEmail,
        doctorPhone: data.doctorPhone,
        institutionNumber: data.institutionNumber,
        shippingAddress: {
          ...data.shippingAddress,
          clinicName: data.clinicName,
        },
        billingAddress: sameAsShipping ? data.shippingAddress : data.billingAddress,
        doctorBankingInfo: data.bankingInfo,
        cardInfo,
        paymentMethod: data.paymentMethod,
        notes: data.notes,
      };

      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        throw new Error("Failed to create order");
      }

      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Order Submitted Successfully",
        description: `Your order #${data.orderNumber} has been submitted for admin approval. You will receive an email confirmation shortly.`,
      });
      // Only clear cart if it's not a direct purchase
      if (!directProduct) {
        clearCart();
      }
      navigate(`/order-confirmation/${data.orderNumber}`);
    },
    onError: (error: any) => {
      toast({
        title: "Order Submission Failed",
        description: error.message || "Please check your information and try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: CheckoutFormData) => {
    createOrderMutation.mutate(data);
  };

  const getCardType = (cardNumber: string): string => {
    const firstDigit = cardNumber.charAt(0);
    if (firstDigit === "4") return "Visa";
    if (firstDigit === "5") return "Mastercard";
    if (firstDigit === "3") return "American Express";
    return "Unknown";
  };

  if (checkoutItems.length === 0) {
    return (
      <div className="min-h-screen pt-16 bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="max-w-4xl mx-auto px-4 py-12 text-center">
          <ShoppingCart className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h1>
          <p className="text-gray-600 mb-6">Add some products to your cart to proceed with checkout.</p>
          <Button onClick={() => navigate("/")} className="bg-blue-600 hover:bg-blue-700">
            Continue Shopping
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-16 bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Checkout</h1>
          <p className="text-gray-600">Complete your order information for admin approval</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2 space-y-6">
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Doctor Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <User className="w-5 h-5 text-blue-600" />
                    <span>Doctor Information</span>
                  </CardTitle>
                  <CardDescription>Your professional contact details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="doctorName">Full Name *</Label>
                      <Input
                        {...form.register("doctorName")}
                        id="doctorName"
                        placeholder="Dr. John Smith"
                        className="mt-1"
                      />
                      {form.formState.errors.doctorName && (
                        <p className="text-sm text-red-600 mt-1">{form.formState.errors.doctorName.message}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="doctorEmail">Email Address *</Label>
                      <Input
                        {...form.register("doctorEmail")}
                        id="doctorEmail"
                        type="email"
                        placeholder="doctor@clinic.com"
                        className="mt-1"
                      />
                      {form.formState.errors.doctorEmail && (
                        <p className="text-sm text-red-600 mt-1">{form.formState.errors.doctorEmail.message}</p>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="doctorPhone">Phone Number *</Label>
                      <Input
                        {...form.register("doctorPhone")}
                        id="doctorPhone"
                        placeholder="(555) 123-4567"
                        className="mt-1"
                      />
                      {form.formState.errors.doctorPhone && (
                        <p className="text-sm text-red-600 mt-1">{form.formState.errors.doctorPhone.message}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="institutionNumber">Institution Number *</Label>
                      <Input
                        {...form.register("institutionNumber")}
                        id="institutionNumber"
                        placeholder="INST123456"
                        className="mt-1"
                      />
                      {form.formState.errors.institutionNumber && (
                        <p className="text-sm text-red-600 mt-1">{form.formState.errors.institutionNumber.message}</p>
                      )}
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="clinicName">Clinic/Practice Name *</Label>
                    <Input
                      {...form.register("billingAddress.street")}
                      id="clinicName"
                      placeholder="Advanced Medical Center"
                      className="mt-1"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Shipping Address */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <MapPin className="w-5 h-5 text-blue-600" />
                    <span>Shipping Address</span>
                  </CardTitle>
                  <CardDescription>Where should we deliver your order?</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="shippingStreet">Street Address *</Label>
                    <Input
                      {...form.register("shippingAddress.street")}
                      id="shippingStreet"
                      placeholder="123 Medical Center Dr"
                      className="mt-1"
                    />
                    {form.formState.errors.shippingAddress?.street && (
                      <p className="text-sm text-red-600 mt-1">{form.formState.errors.shippingAddress.street.message}</p>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="shippingCity">City *</Label>
                      <Input
                        {...form.register("shippingAddress.city")}
                        id="shippingCity"
                        placeholder="New York"
                        className="mt-1"
                      />
                      {form.formState.errors.shippingAddress?.city && (
                        <p className="text-sm text-red-600 mt-1">{form.formState.errors.shippingAddress.city.message}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="shippingState">State *</Label>
                      <Input
                        {...form.register("shippingAddress.state")}
                        id="shippingState"
                        placeholder="NY"
                        className="mt-1"
                      />
                      {form.formState.errors.shippingAddress?.state && (
                        <p className="text-sm text-red-600 mt-1">{form.formState.errors.shippingAddress.state.message}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="shippingZip">ZIP Code *</Label>
                      <Input
                        {...form.register("shippingAddress.zipCode")}
                        id="shippingZip"
                        placeholder="10001"
                        className="mt-1"
                      />
                      {form.formState.errors.shippingAddress?.zipCode && (
                        <p className="text-sm text-red-600 mt-1">{form.formState.errors.shippingAddress.zipCode.message}</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Banking Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Building className="w-5 h-5 text-blue-600" />
                    <span>Banking Information</span>
                  </CardTitle>
                  <CardDescription>Your banking details for payment processing</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="bankName">Bank Name *</Label>
                    <Input
                      {...form.register("bankingInfo.bankName")}
                      id="bankName"
                      placeholder="Chase Bank"
                      className="mt-1"
                    />
                    {form.formState.errors.bankingInfo?.bankName && (
                      <p className="text-sm text-red-600 mt-1">{form.formState.errors.bankingInfo.bankName.message}</p>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="accountNumber">Account Number *</Label>
                      <Input
                        {...form.register("bankingInfo.accountNumber")}
                        id="accountNumber"
                        type="password"
                        placeholder="••••••••"
                        className="mt-1"
                      />
                      {form.formState.errors.bankingInfo?.accountNumber && (
                        <p className="text-sm text-red-600 mt-1">{form.formState.errors.bankingInfo.accountNumber.message}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="routingNumber">Routing Number *</Label>
                      <Input
                        {...form.register("bankingInfo.routingNumber")}
                        id="routingNumber"
                        placeholder="123456789"
                        className="mt-1"
                      />
                      {form.formState.errors.bankingInfo?.routingNumber && (
                        <p className="text-sm text-red-600 mt-1">{form.formState.errors.bankingInfo.routingNumber.message}</p>
                      )}
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="accountType">Account Type *</Label>
                    <Select onValueChange={(value) => form.setValue("bankingInfo.accountType", value as "checking" | "savings")}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select account type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="checking">Checking</SelectItem>
                        <SelectItem value="savings">Savings</SelectItem>
                      </SelectContent>
                    </Select>
                    {form.formState.errors.bankingInfo?.accountType && (
                      <p className="text-sm text-red-600 mt-1">{form.formState.errors.bankingInfo.accountType.message}</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Card Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <CreditCard className="w-5 h-5 text-blue-600" />
                    <span>Card Information</span>
                  </CardTitle>
                  <CardDescription>Your credit/debit card details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="cardNumber">Card Number *</Label>
                    <Input
                      {...form.register("cardInfo.cardNumber")}
                      id="cardNumber"
                      placeholder="1234 5678 9012 3456"
                      className="mt-1"
                    />
                    {form.formState.errors.cardInfo?.cardNumber && (
                      <p className="text-sm text-red-600 mt-1">{form.formState.errors.cardInfo.cardNumber.message}</p>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="expiryMonth">Expiry Month *</Label>
                      <Input
                        {...form.register("cardInfo.expiryMonth")}
                        id="expiryMonth"
                        placeholder="MM"
                        maxLength={2}
                        className="mt-1"
                      />
                      {form.formState.errors.cardInfo?.expiryMonth && (
                        <p className="text-sm text-red-600 mt-1">{form.formState.errors.cardInfo.expiryMonth.message}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="expiryYear">Expiry Year *</Label>
                      <Input
                        {...form.register("cardInfo.expiryYear")}
                        id="expiryYear"
                        placeholder="YYYY"
                        maxLength={4}
                        className="mt-1"
                      />
                      {form.formState.errors.cardInfo?.expiryYear && (
                        <p className="text-sm text-red-600 mt-1">{form.formState.errors.cardInfo.expiryYear.message}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="cvv">CVV *</Label>
                      <Input
                        {...form.register("cardInfo.cvv")}
                        id="cvv"
                        type="password"
                        placeholder="123"
                        maxLength={4}
                        className="mt-1"
                      />
                      {form.formState.errors.cardInfo?.cvv && (
                        <p className="text-sm text-red-600 mt-1">{form.formState.errors.cardInfo.cvv.message}</p>
                      )}
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="cardholderName">Cardholder Name *</Label>
                    <Input
                      {...form.register("cardInfo.cardholderName")}
                      id="cardholderName"
                      placeholder="Dr. John Smith"
                      className="mt-1"
                    />
                    {form.formState.errors.cardInfo?.cardholderName && (
                      <p className="text-sm text-red-600 mt-1">{form.formState.errors.cardInfo.cardholderName.message}</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Additional Notes */}
              <Card>
                <CardHeader>
                  <CardTitle>Additional Notes</CardTitle>
                  <CardDescription>Any special instructions or comments</CardDescription>
                </CardHeader>
                <CardContent>
                  <Textarea
                    {...form.register("notes")}
                    placeholder="Special delivery instructions, questions, or comments..."
                    className="min-h-[100px]"
                  />
                </CardContent>
              </Card>

              <Button
                type="submit"
                size="lg"
                className="w-full bg-blue-600 hover:bg-blue-700"
                disabled={createOrderMutation.isPending}
              >
                {createOrderMutation.isPending ? "Submitting Order..." : "Submit Order for Approval"}
              </Button>
            </form>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {checkoutItems.map((item, index) => (
                    <div key={item.product?.id || index} className="flex justify-between items-start text-sm">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{item.product.name}</p>
                        <p className="text-gray-500">Qty: {item.quantity}</p>
                      </div>
                      <p className="font-medium">${(parseFloat(item.product.price) * item.quantity).toFixed(2)}</p>
                    </div>
                  ))}
                </div>
                <Separator />
                <div className="flex justify-between items-center text-lg font-bold">
                  <span>Total</span>
                  <span className="text-blue-600">${checkoutTotal.toFixed(2)}</span>
                </div>
                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Important:</strong> Your order will be reviewed by our admin team before processing. 
                    You will receive an email confirmation once approved.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}