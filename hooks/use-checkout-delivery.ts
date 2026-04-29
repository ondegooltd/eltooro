"use client";

import { useState, useEffect, useCallback } from "react";

/**
 * Loads admin delivery fee settings and active shipping methods for checkout.
 */
export function useCheckoutDelivery() {
  const [deliveryFees, setDeliveryFees] = useState<any>(null);
  const [shippingMethods, setShippingMethods] = useState<any[]>([]);
  const [shippingMethod, setShippingMethod] = useState<string>("");
  const [isLoadingFees, setIsLoadingFees] = useState(true);
  const [isLoadingShippingMethods, setIsLoadingShippingMethods] = useState(true);

  const fetchDeliveryFees = useCallback(async () => {
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
  }, []);

  const fetchShippingMethods = useCallback(async () => {
    try {
      setIsLoadingShippingMethods(true);
      const response = await fetch("/api/shipping-methods");
      const data = await response.json();
      if (data.success && data.data && data.data.length > 0) {
        setShippingMethods(data.data);
        setShippingMethod((prev) => {
          if (prev) return prev;
          return data.data[0].code as string;
        });
      }
    } catch (error) {
      console.error("Failed to fetch shipping methods:", error);
    } finally {
      setIsLoadingShippingMethods(false);
    }
  }, []);

  useEffect(() => {
    void fetchDeliveryFees();
    void fetchShippingMethods();
  }, [fetchDeliveryFees, fetchShippingMethods]);

  return {
    deliveryFees,
    shippingMethods,
    shippingMethod,
    setShippingMethod,
    isLoadingFees,
    isLoadingShippingMethods,
    refetchDelivery: fetchDeliveryFees,
    refetchShippingMethods: fetchShippingMethods,
  };
}
