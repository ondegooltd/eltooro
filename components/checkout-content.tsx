"use client";

import type React from "react";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  ChevronRight,
  ChevronDown,
  CreditCard,
  Truck,
  MapPin,
  Lock,
  Check,
  Shield,
  Clock,
  Loader2,
  Smartphone,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useCart } from "@/contexts/cart-context";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { ProtectedRoute } from "@/components/auth/protected-route";

type CheckoutStep = "shipping" | "payment" | "review";

export function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const { items, itemCount, subtotal, savings, clearCart } = useCart();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState<CheckoutStep>("shipping");
  const [isOrderSummaryOpen, setIsOrderSummaryOpen] = useState(false);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [isInitializingPayment, setIsInitializingPayment] = useState(false);
  const [deliveryFees, setDeliveryFees] = useState<any>(null);
  const [isLoadingFees, setIsLoadingFees] = useState(true);

  // Shipping Form State
  const [shippingData, setShippingData] = useState({
    email: "",
    firstName: "",
    lastName: "",
    address: "",
    apartment: "",
    city: "",
    region: "",
    postalCode: "",
    phone: "",
    saveInfo: true,
  });

  // Shipping Method State
  const [shippingMethod, setShippingMethod] = useState("standard");

  // Payment State - Only Mobile Money
  const [mobileMoneyNumber, setMobileMoneyNumber] = useState("");
  const [billingAddressSame, setBillingAddressSame] = useState(true);

  // Check for payment verification on mount
  useEffect(() => {
    const reference = searchParams.get("reference");
    const trxref = searchParams.get("trxref");
    const orderId = searchParams.get("orderId");

    if (reference || trxref) {
      handlePaymentVerification(reference || trxref || "", orderId || "");
    }
  }, []);

  // Fetch delivery fees
  useEffect(() => {
    fetchDeliveryFees();
  }, []);

  // Load user data if logged in
  useEffect(() => {
    if (session?.user) {
      loadUserData();
    }
  }, [session]);

  const fetchDeliveryFees = async () => {
    try {
      setIsLoadingFees(true);
      const response = await fetch("/api/admin/settings");
      const data = await response.json();
      if (data.success) {
        setDeliveryFees(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch delivery fees:", error);
    } finally {
      setIsLoadingFees(false);
    }
  };

  const loadUserData = async () => {
    try {
      const response = await fetch("/api/users/profile");
      const data = await response.json();
      if (data.success && data.data) {
        const user = data.data;
        setShippingData({
          email: user.email || "",
          firstName: user.name?.first || "",
          lastName: user.name?.last || "",
          address:
            user.addresses?.find(
              (a: any) => a.isDefault && a.type === "shipping"
            )?.address || "",
          apartment:
            user.addresses?.find(
              (a: any) => a.isDefault && a.type === "shipping"
            )?.apartment || "",
          city:
            user.addresses?.find(
              (a: any) => a.isDefault && a.type === "shipping"
            )?.city || "",
          region:
            user.addresses?.find(
              (a: any) => a.isDefault && a.type === "shipping"
            )?.region || "",
          postalCode:
            user.addresses?.find(
              (a: any) => a.isDefault && a.type === "shipping"
            )?.postalCode || "",
          phone:
            user.phone ||
            user.addresses?.find(
              (a: any) => a.isDefault && a.type === "shipping"
            )?.phone ||
            "",
          saveInfo: true,
        });
        setMobileMoneyNumber(user.phone || "");
      }
    } catch (error) {
      console.error("Failed to load user data:", error);
    }
  };

  const calculateShippingCost = () => {
    if (!deliveryFees) return 0;
    const cityMap: Record<string, keyof typeof deliveryFees.deliveryFees> = {
      Winneba: "winneba",
      Mankesim: "mankesim",
      Accra: "accra",
      "Cape Coast": "capeCoast",
      Takoradi: "takoradi",
      Kumasi: "kumasi",
      Sunyani: "sunyani",
    };
    const cityKey = cityMap[shippingData.city] || "accra";
    return deliveryFees.deliveryFees[cityKey] || 50;
  };

  // Calculations
  const shippingCost =
    shippingMethod === "express"
      ? calculateShippingCost() * 1.5
      : calculateShippingCost();
  const freeShippingEligible =
    subtotal >= (deliveryFees?.settings?.freeShippingThreshold || 200);
  const finalShipping =
    freeShippingEligible && shippingMethod === "standard" ? 0 : shippingCost;
  const serviceFee = items.length * (deliveryFees?.serviceFees?.ghana || 3);
  const total = subtotal + finalShipping + serviceFee - savings;

  const steps = [
    { id: "shipping", label: "Shipping", icon: MapPin },
    { id: "payment", label: "Payment", icon: CreditCard },
    { id: "review", label: "Review", icon: Check },
  ];

  const handleShippingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentStep("payment");
  };

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mobileMoneyNumber.trim()) {
      toast({
        title: "Error",
        description: "Please enter your Mobile Money number",
        variant: "destructive",
      });
      return;
    }
    setCurrentStep("review");
  };

  const handlePlaceOrder = async () => {
    try {
      setIsPlacingOrder(true);

      // Create order
      const orderResponse = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          items: items.map((item) => ({
            productId: item.productId || item.id,
            quantity: item.quantity,
            price: item.price,
          })),
          shipping: {
            firstName: shippingData.firstName,
            lastName: shippingData.lastName,
            address: shippingData.address,
            apartment: shippingData.apartment || undefined,
            city: shippingData.city,
            region: shippingData.region,
            postalCode: shippingData.postalCode || undefined,
            phone: shippingData.phone,
          },
          billing: billingAddressSame
            ? {
                firstName: shippingData.firstName,
                lastName: shippingData.lastName,
                address: shippingData.address,
                city: shippingData.city,
                region: shippingData.region,
                postalCode: shippingData.postalCode || undefined,
              }
            : {
                firstName: shippingData.firstName,
                lastName: shippingData.lastName,
                address: shippingData.address,
                city: shippingData.city,
                region: shippingData.region,
                postalCode: shippingData.postalCode || undefined,
              },
          paymentMethod: "momo",
          currency: "GHS",
        }),
      });

      const orderData = await orderResponse.json();

      if (!orderData.success) {
        throw new Error(orderData.message || "Failed to create order");
      }

      const order = orderData.data;

      // Initialize payment
      setIsInitializingPayment(true);
      const paymentResponse = await fetch("/api/payments/initialize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderId: order._id,
          phone: mobileMoneyNumber,
        }),
      });

      const paymentData = await paymentResponse.json();

      if (!paymentData.success) {
        throw new Error(paymentData.message || "Failed to initialize payment");
      }

      // Redirect to Paystack payment page
      if (paymentData.data.authorizationUrl) {
        window.location.href = paymentData.data.authorizationUrl;
      } else {
        throw new Error("Payment URL not received");
      }
    } catch (error: any) {
      console.error("Failed to place order:", error);
      toast({
        title: "Error",
        description:
          error.message || "Failed to place order. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsPlacingOrder(false);
      setIsInitializingPayment(false);
    }
  };

  const handlePaymentVerification = async (
    reference: string,
    orderId: string
  ) => {
    try {
      const response = await fetch("/api/payments/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ reference }),
      });

      const data = await response.json();

      if (data.success && data.data.success) {
        clearCart();
        // Use order ID from response or from URL
        const finalOrderId =
          data.data.order?._id ||
          data.data.order?.orderNumber ||
          orderId ||
          reference;
        router.push(`/checkout/success?orderId=${finalOrderId}`);
      } else {
        toast({
          title: "Payment Failed",
          description: data.data?.message || "Payment verification failed",
          variant: "destructive",
        });
        router.push("/checkout");
      }
    } catch (error) {
      console.error("Payment verification failed:", error);
      toast({
        title: "Error",
        description: "Failed to verify payment",
        variant: "destructive",
      });
    }
  };

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-md mx-auto text-center">
          <h2 className="text-2xl font-bold mb-4">Your cart is empty</h2>
          <p className="text-muted-foreground mb-6">
            Add some items to your cart before checkout.
          </p>
          <Button asChild className="bg-iherb-green hover:bg-iherb-green-dark">
            <Link href="/products">Continue Shopping</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
        <Link href="/" className="hover:text-iherb-green">
          Home
        </Link>
        <ChevronRight className="h-4 w-4" />
        <Link href="/cart" className="hover:text-iherb-green">
          Cart
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-foreground font-medium">Checkout</span>
      </nav>

      {/* Progress Steps */}
      <div className="flex items-center justify-center mb-8">
        {steps.map((step, index) => {
          const StepIcon = step.icon;
          const isActive = step.id === currentStep;
          const isCompleted =
            steps.findIndex((s) => s.id === currentStep) > index;

          return (
            <div key={step.id} className="flex items-center">
              <div
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-full transition-colors",
                  isActive && "bg-iherb-green text-white",
                  isCompleted && "bg-iherb-green/20 text-iherb-green",
                  !isActive && !isCompleted && "bg-muted text-muted-foreground"
                )}
              >
                {isCompleted ? (
                  <Check className="h-5 w-5" />
                ) : (
                  <StepIcon className="h-5 w-5" />
                )}
                <span className="font-medium hidden sm:inline">
                  {step.label}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    "w-8 sm:w-16 h-0.5 mx-2",
                    isCompleted ? "bg-iherb-green" : "bg-border"
                  )}
                />
              )}
            </div>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {/* Shipping Step */}
          {currentStep === "shipping" && (
            <form onSubmit={handleShippingSubmit} className="space-y-6">
              <div className="bg-white rounded-lg border border-border p-4 sm:p-6">
                <h2 className="text-lg sm:text-xl font-bold text-foreground mb-4 sm:mb-6 flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-iherb-green" />
                  Shipping Information
                </h2>

                {/* Contact */}
                <div className="mb-6">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={shippingData.email}
                    onChange={(e) =>
                      setShippingData({
                        ...shippingData,
                        email: e.target.value,
                      })
                    }
                    required
                    className="mt-1"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    We'll send your order confirmation here
                  </p>
                </div>

                {/* Name */}
                <div className="grid sm:grid-cols-2 gap-4 mb-4">
                  <div>
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      placeholder="John"
                      value={shippingData.firstName}
                      onChange={(e) =>
                        setShippingData({
                          ...shippingData,
                          firstName: e.target.value,
                        })
                      }
                      required
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      placeholder="Doe"
                      value={shippingData.lastName}
                      onChange={(e) =>
                        setShippingData({
                          ...shippingData,
                          lastName: e.target.value,
                        })
                      }
                      required
                      className="mt-1"
                    />
                  </div>
                </div>

                {/* Address */}
                <div className="mb-4">
                  <Label htmlFor="address">Street Address</Label>
                  <Input
                    id="address"
                    placeholder="123 Main Street"
                    value={shippingData.address}
                    onChange={(e) =>
                      setShippingData({
                        ...shippingData,
                        address: e.target.value,
                      })
                    }
                    required
                    className="mt-1"
                  />
                </div>

                <div className="mb-4">
                  <Label htmlFor="apartment">
                    Apartment, Suite, etc. (optional)
                  </Label>
                  <Input
                    id="apartment"
                    placeholder="Apt 4B"
                    value={shippingData.apartment}
                    onChange={(e) =>
                      setShippingData({
                        ...shippingData,
                        apartment: e.target.value,
                      })
                    }
                    className="mt-1"
                  />
                </div>

                <div className="grid sm:grid-cols-3 gap-4 mb-4">
                  <div>
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      placeholder="Accra"
                      value={shippingData.city}
                      onChange={(e) =>
                        setShippingData({
                          ...shippingData,
                          city: e.target.value,
                        })
                      }
                      required
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="region">Region</Label>
                    <Input
                      id="region"
                      placeholder="Greater Accra"
                      value={shippingData.region}
                      onChange={(e) =>
                        setShippingData({
                          ...shippingData,
                          region: e.target.value,
                        })
                      }
                      required
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="postalCode">Postal Code</Label>
                    <Input
                      id="postalCode"
                      placeholder="00233"
                      value={shippingData.postalCode}
                      onChange={(e) =>
                        setShippingData({
                          ...shippingData,
                          postalCode: e.target.value,
                        })
                      }
                      className="mt-1"
                    />
                  </div>
                </div>

                <div className="mb-6">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+233 XX XXX XXXX"
                    value={shippingData.phone}
                    onChange={(e) =>
                      setShippingData({
                        ...shippingData,
                        phone: e.target.value,
                      })
                    }
                    required
                    className="mt-1"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <Checkbox
                    id="saveInfo"
                    checked={shippingData.saveInfo}
                    onCheckedChange={(checked) =>
                      setShippingData({
                        ...shippingData,
                        saveInfo: checked as boolean,
                      })
                    }
                  />
                  <Label htmlFor="saveInfo" className="text-sm cursor-pointer">
                    Save this information for next time
                  </Label>
                </div>
              </div>

              {/* Shipping Method */}
              <div className="bg-white rounded-lg border border-border p-4 sm:p-6">
                <h2 className="text-lg sm:text-xl font-bold text-foreground mb-4 sm:mb-6 flex items-center gap-2">
                  <Truck className="h-5 w-5 text-iherb-green" />
                  Shipping Method
                </h2>

                <RadioGroup
                  value={shippingMethod}
                  onValueChange={setShippingMethod}
                >
                  <label
                    className={cn(
                      "flex items-center justify-between p-3 sm:p-4 border rounded-lg cursor-pointer transition-colors mb-3 min-h-[3.5rem]",
                      shippingMethod === "standard"
                        ? "border-iherb-green bg-iherb-green/5"
                        : "border-border hover:border-muted-foreground"
                    )}
                  >
                    <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                      <RadioGroupItem
                        value="standard"
                        id="standard"
                        className="shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-sm sm:text-base">
                          Standard Shipping
                        </p>
                        <p className="text-xs sm:text-sm text-muted-foreground">
                          4-7 business days
                        </p>
                      </div>
                    </div>
                    <span
                      className={cn(
                        "font-semibold text-sm sm:text-base shrink-0 ml-2",
                        freeShippingEligible && "text-iherb-green"
                      )}
                    >
                      {freeShippingEligible
                        ? "FREE"
                        : `GH₵${shippingCost.toFixed(2)}`}
                    </span>
                  </label>

                  <label
                    className={cn(
                      "flex items-center justify-between p-3 sm:p-4 border rounded-lg cursor-pointer transition-colors min-h-[3.5rem]",
                      shippingMethod === "express"
                        ? "border-iherb-green bg-iherb-green/5"
                        : "border-border hover:border-muted-foreground"
                    )}
                  >
                    <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                      <RadioGroupItem
                        value="express"
                        id="express"
                        className="shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-sm sm:text-base">
                          Express Shipping
                        </p>
                        <p className="text-xs sm:text-sm text-muted-foreground">
                          2-3 business days
                        </p>
                      </div>
                    </div>
                    <span className="font-semibold text-sm sm:text-base shrink-0 ml-2">
                      GH₵{(shippingCost * 1.5).toFixed(2)}
                    </span>
                  </label>
                </RadioGroup>
              </div>

              <Button
                type="submit"
                className="w-full h-12 sm:h-14 bg-iherb-green hover:bg-iherb-green-dark text-sm sm:text-base font-semibold min-h-[3rem]"
              >
                Continue to Payment
              </Button>
            </form>
          )}

          {/* Payment Step - Mobile Money Only */}
          {currentStep === "payment" && (
            <form onSubmit={handlePaymentSubmit} className="space-y-6">
              <div className="bg-white rounded-lg border border-border p-4 sm:p-6">
                <h2 className="text-lg sm:text-xl font-bold text-foreground mb-4 sm:mb-6 flex items-center gap-2">
                  <Smartphone className="h-5 w-5 text-iherb-green" />
                  Payment Method
                </h2>

                <div className="bg-iherb-green/5 border border-iherb-green rounded-lg p-4 mb-6">
                  <div className="flex items-center gap-3">
                    <Smartphone className="h-6 w-6 text-iherb-green" />
                    <div>
                      <p className="font-semibold">Mobile Money</p>
                      <p className="text-sm text-muted-foreground">
                        Pay securely with MTN, Vodafone, or AirtelTigo Mobile
                        Money
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="mobileMoneyNumber">
                      Mobile Money Number
                    </Label>
                    <Input
                      id="mobileMoneyNumber"
                      type="tel"
                      placeholder="+233 XX XXX XXXX"
                      value={mobileMoneyNumber}
                      onChange={(e) => setMobileMoneyNumber(e.target.value)}
                      required
                      className="mt-1"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      You will receive a prompt to authorize the payment on your
                      phone
                    </p>
                  </div>
                </div>
              </div>

              {/* Billing Address */}
              <div className="bg-white rounded-lg border border-border p-4 sm:p-6">
                <h3 className="font-semibold text-foreground mb-4 text-base sm:text-lg">
                  Billing Address
                </h3>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="billingAddressSame"
                    checked={billingAddressSame}
                    onCheckedChange={(checked) =>
                      setBillingAddressSame(checked as boolean)
                    }
                  />
                  <Label
                    htmlFor="billingAddressSame"
                    className="cursor-pointer"
                  >
                    Same as shipping address
                  </Label>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCurrentStep("shipping")}
                  className="flex-1 h-12 sm:h-14 min-h-[3rem] text-sm sm:text-base"
                >
                  Back to Shipping
                </Button>
                <Button
                  type="submit"
                  className="flex-1 h-12 sm:h-14 bg-iherb-green hover:bg-iherb-green-dark text-sm sm:text-base font-semibold min-h-[3rem]"
                >
                  Review Order
                </Button>
              </div>
            </form>
          )}

          {/* Review Step */}
          {currentStep === "review" && (
            <div className="space-y-4 sm:space-y-6">
              {/* Shipping Summary */}
              <div className="bg-white rounded-lg border border-border p-4 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-foreground flex items-center gap-2 text-base sm:text-lg">
                    <MapPin className="h-5 w-5 text-iherb-green" />
                    Shipping Address
                  </h3>
                  <Button
                    variant="link"
                    onClick={() => setCurrentStep("shipping")}
                    className="text-iherb-green p-0 h-auto"
                  >
                    Edit
                  </Button>
                </div>
                <p className="text-muted-foreground">
                  {shippingData.firstName} {shippingData.lastName}
                  <br />
                  {shippingData.address}
                  {shippingData.apartment && `, ${shippingData.apartment}`}
                  <br />
                  {shippingData.city}, {shippingData.region}{" "}
                  {shippingData.postalCode}
                  <br />
                  {shippingData.phone}
                </p>
              </div>

              {/* Payment Summary */}
              <div className="bg-white rounded-lg border border-border p-4 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-foreground flex items-center gap-2 text-base sm:text-lg">
                    <Smartphone className="h-5 w-5 text-iherb-green" />
                    Payment Method
                  </h3>
                  <Button
                    variant="link"
                    onClick={() => setCurrentStep("payment")}
                    className="text-iherb-green p-0 h-auto"
                  >
                    Edit
                  </Button>
                </div>
                <p className="text-muted-foreground">
                  Mobile Money - {mobileMoneyNumber}
                </p>
              </div>

              {/* Order Items */}
              <div className="bg-white rounded-lg border border-border p-4 sm:p-6">
                <h3 className="font-semibold text-foreground mb-4 text-base sm:text-lg">
                  Order Items ({itemCount})
                </h3>
                <div className="space-y-4">
                  {items.map((item) => (
                    <div key={item.id} className="flex gap-4">
                      <div className="relative w-16 h-16 rounded-lg border border-border overflow-hidden bg-white shrink-0">
                        <Image
                          src={item.image || "/placeholder.svg"}
                          alt={item.name}
                          fill
                          className="object-contain p-1"
                        />
                        <span className="absolute -top-1 -right-1 bg-iherb-green text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                          {item.quantity}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm line-clamp-2">
                          {item.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {item.brand}
                        </p>
                      </div>
                      <p className="font-semibold text-sm shrink-0">
                        GH₵{(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Place Order */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCurrentStep("payment")}
                  className="flex-1 h-12 sm:h-14 min-h-[3rem] text-sm sm:text-base"
                  disabled={isPlacingOrder || isInitializingPayment}
                >
                  Back to Payment
                </Button>
                <Button
                  onClick={handlePlaceOrder}
                  disabled={isPlacingOrder || isInitializingPayment}
                  className="flex-1 h-12 sm:h-14 bg-iherb-green hover:bg-iherb-green-dark text-sm sm:text-base font-semibold min-h-[3rem]"
                >
                  {isPlacingOrder || isInitializingPayment ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      {isPlacingOrder
                        ? "Creating Order..."
                        : "Initializing Payment..."}
                    </>
                  ) : (
                    <>
                      <Lock className="h-4 w-4 mr-2" />
                      Place Order
                    </>
                  )}
                </Button>
              </div>

              <p className="text-center text-xs text-muted-foreground">
                By placing your order, you agree to our{" "}
                <Link
                  href="/terms"
                  className="text-iherb-green hover:underline"
                >
                  Terms of Use
                </Link>{" "}
                and{" "}
                <Link
                  href="/privacy"
                  className="text-iherb-green hover:underline"
                >
                  Privacy Policy
                </Link>
              </p>
            </div>
          )}
        </div>

        {/* Order Summary Sidebar */}
        <div className="lg:col-span-1">
          {/* Mobile Collapsible */}
          <Collapsible
            open={isOrderSummaryOpen}
            onOpenChange={setIsOrderSummaryOpen}
            className="lg:hidden mb-6"
          >
            <CollapsibleTrigger className="flex items-center justify-between w-full bg-white rounded-lg border border-border p-4">
              <span className="font-semibold">
                Order Summary ({itemCount} items)
              </span>
              <div className="flex items-center gap-2">
                <span className="font-bold">GH₵{total.toFixed(2)}</span>
                <ChevronDown
                  className={cn(
                    "h-5 w-5 transition-transform",
                    isOrderSummaryOpen && "rotate-180"
                  )}
                />
              </div>
            </CollapsibleTrigger>
            <CollapsibleContent className="bg-white rounded-b-lg border border-t-0 border-border p-4">
              <OrderSummaryContent
                items={items}
                subtotal={subtotal}
                savings={savings}
                shipping={finalShipping}
                serviceFee={serviceFee}
                total={total}
              />
            </CollapsibleContent>
          </Collapsible>

          {/* Desktop Sidebar */}
          <div className="hidden lg:block bg-white rounded-lg border border-border p-6 sticky top-24">
            <h2 className="text-lg font-bold text-foreground mb-4">
              Order Summary
            </h2>
            <OrderSummaryContent
              items={items}
              subtotal={subtotal}
              savings={savings}
              shipping={finalShipping}
              serviceFee={serviceFee}
              total={total}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function OrderSummaryContent({
  items,
  subtotal,
  savings,
  shipping,
  serviceFee,
  total,
}: {
  items: any[];
  subtotal: number;
  savings: number;
  shipping: number;
  serviceFee: number;
  total: number;
}) {
  return (
    <>
      {/* Items Preview */}
      <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
        {items.map((item) => (
          <div key={item.id} className="flex gap-3">
            <div className="relative w-12 h-12 rounded border border-border overflow-hidden bg-white shrink-0">
              <Image
                src={item.image || "/placeholder.svg"}
                alt={item.name}
                fill
                className="object-contain p-1"
              />
              <span className="absolute -top-1 -right-1 bg-iherb-green text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                {item.quantity}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium line-clamp-2">{item.name}</p>
            </div>
            <p className="text-xs font-semibold shrink-0">
              GH₵{(item.price * item.quantity).toFixed(2)}
            </p>
          </div>
        ))}
      </div>

      {/* Summary Lines */}
      <div className="space-y-2 py-4 border-t border-border">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Subtotal</span>
          <span className="font-medium">GH₵{subtotal.toFixed(2)}</span>
        </div>
        {savings > 0 && (
          <div className="flex justify-between text-sm text-iherb-green">
            <span>Savings</span>
            <span>-GH₵{savings.toFixed(2)}</span>
          </div>
        )}
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Service Fee</span>
          <span className="font-medium">GH₵{serviceFee.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Shipping</span>
          <span
            className={cn("font-medium", shipping === 0 && "text-iherb-green")}
          >
            {shipping === 0 ? "FREE" : `GH₵${shipping.toFixed(2)}`}
          </span>
        </div>
      </div>

      {/* Total */}
      <div className="flex justify-between items-center pt-4 border-t border-border">
        <span className="font-bold">Total</span>
        <span className="text-xl font-bold">GH₵{total.toFixed(2)}</span>
      </div>

      {/* Trust Badges */}
      <div className="mt-4 pt-4 border-t border-border space-y-2">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Shield className="h-4 w-4 text-iherb-green" />
          <span>Secure SSL checkout</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Clock className="h-4 w-4 text-iherb-green" />
          <span>30-day return policy</span>
        </div>
      </div>
    </>
  );
}
