"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CreditCard, Plus, Loader2, ArrowLeft, Trash2 } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";

export default function PaymentsPage() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [showContent, setShowContent] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);

  useEffect(() => {
    if (session) {
      // Payment methods are typically stored during checkout
      // For now, we'll show a message that payment methods are saved during checkout
      setIsLoading(false);
      setTimeout(() => setShowContent(true), 150);
    }
  }, [session]);

  return (
    <ProtectedRoute>
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 bg-muted relative">
          {/* Loading Overlay */}
          {isLoading && (
            <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center transition-opacity duration-300">
              <Loader2 className="h-8 w-8 animate-spin text-iherb-green" />
            </div>
          )}

          {/* Content with smooth fade-in */}
          <div
            className={`container mx-auto px-4 py-8 transition-opacity duration-500 ease-in-out ${
              showContent && !isLoading ? "opacity-100" : "opacity-0"
            }`}
          >
            <div className="flex items-center gap-4 mb-6">
              <Link href="/account">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Account
                </Button>
              </Link>
            </div>

            <div className="mb-6 sm:mb-8">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold">
                  Payment Methods
                </h1>
                <p className="text-sm sm:text-base text-muted-foreground mt-1">
                  Manage your saved payment methods
                </p>
              </div>
            </div>

            {paymentMethods.length === 0 ? (
              <div className="bg-card border rounded-lg p-8 sm:p-12 text-center">
                <CreditCard className="h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-base sm:text-lg font-semibold mb-2">
                  No saved payment methods
                </h3>
                <p className="text-sm sm:text-base text-muted-foreground mb-4">
                  Payment methods are saved automatically during checkout for
                  faster future purchases.
                </p>
                <Link href="/products">
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Start Shopping
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {paymentMethods.map((method) => (
                  <div
                    key={method.id}
                    className="bg-card border rounded-lg p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
                  >
                    <div className="flex items-center gap-3 sm:gap-4">
                      <CreditCard className="h-6 w-6 sm:h-8 sm:w-8 text-iherb-green shrink-0" />
                      <div className="min-w-0">
                        <p className="font-semibold text-sm sm:text-base">
                          {method.type === "card"
                            ? `**** **** **** ${method.last4}`
                            : method.type}
                        </p>
                        <p className="text-xs sm:text-sm text-muted-foreground">
                          {method.brand} • Expires {method.expMonth}/
                          {method.expYear}
                        </p>
                      </div>
                      {method.isDefault && (
                        <Badge className="bg-iherb-green text-xs sm:text-sm shrink-0">
                          Default
                        </Badge>
                      )}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:text-red-700 w-full sm:w-auto"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-6 sm:mt-8 bg-card border rounded-lg p-4 sm:p-6">
              <h3 className="font-semibold text-sm sm:text-base mb-2">
                Payment Security
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground">
                All payment information is securely processed through our
                payment partners. We do not store your full card details on our
                servers.
              </p>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </ProtectedRoute>
  );
}
