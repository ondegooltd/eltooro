import { getDb } from "@/lib/db/mongodb";
import {
  findCityFee,
  isListedCity,
  DEFAULT_DELIVERY_CITIES,
  OTHER_CITY_DEFAULT_FEE,
  type DeliveryCity,
} from "@/lib/shipping/ghana-cities";

export interface CartItem {
  productId: string;
  quantity: number;
  price: number;
}

export async function calculateServiceFee(
  items: CartItem[],
  isInternational: boolean,
): Promise<number> {
  const db = await getDb();
  const settings = await db.collection("adminsettings").findOne({});

  if (!settings) {
    // Default values
    return isInternational ? items.length * 30 : items.length * 3;
  }

  const feePerItem = isInternational
    ? settings.serviceFees.international
    : settings.serviceFees.ghana;

  return items.length * feePerItem;
}

export async function calculateDeliveryFee(
  city: string,
  isInternational: boolean,
): Promise<number> {
  const db = await getDb();
  const settings = await db.collection("adminsettings").findOne({});

  if (!settings) {
    // No settings configured: fall back to the built-in defaults.
    if (isInternational) return 0;
    return findCityFee(DEFAULT_DELIVERY_CITIES, city) ?? OTHER_CITY_DEFAULT_FEE;
  }

  if (isInternational) {
    return settings.deliveryFees.international || 0;
  }

  const cities = settings.deliveryFees.cities as DeliveryCity[] | undefined;
  const otherFee = settings.deliveryFees.other ?? OTHER_CITY_DEFAULT_FEE;
  // Listed city → its fee; otherwise the configurable "other" fee.
  return findCityFee(cities, city) ?? otherFee;
}

/**
 * Authoritative shipping total charged for an order. Combines the base city
 * delivery fee with the selected delivery method's multiplier, and applies the
 * free-shipping threshold — so the amount charged always matches what the
 * checkout displays (the client must not be trusted for pricing).
 */
export async function calculateShippingTotal(params: {
  city: string;
  isInternational: boolean;
  subtotal: number;
  shippingMethodCode?: string;
}): Promise<number> {
  const { city, isInternational, subtotal, shippingMethodCode } = params;
  const db = await getDb();
  const settings = await db.collection("adminsettings").findOne({});

  const baseFee = await calculateDeliveryFee(city, isInternational);

  // Resolve the multiplier from the selected delivery method (default 1.0).
  let multiplier = 1;
  if (shippingMethodCode) {
    const method = await db
      .collection("shipping_methods")
      .findOne({ code: shippingMethodCode });
    if (method && typeof method.multiplier === "number") {
      multiplier = method.multiplier;
    }
  }

  // Free standard shipping above the configured threshold — domestic, standard
  // method, and ONLY for listed cities (never unlisted "Other" destinations).
  const threshold = settings?.settings?.freeShippingThreshold;
  const isStandard = !shippingMethodCode || shippingMethodCode === "standard";
  const cities = settings?.deliveryFees?.cities as DeliveryCity[] | undefined;
  if (
    !isInternational &&
    isStandard &&
    isListedCity(cities, city) &&
    typeof threshold === "number" &&
    subtotal >= threshold
  ) {
    return 0;
  }

  return baseFee * multiplier;
}

export async function calculateDeliveryTime(
  city: string,
  isInternational: boolean,
): Promise<{ estimatedDelivery: Date; deliveryTime: string }> {
  const db = await getDb();
  const settings = await db.collection("adminsettings").findOne({});

  const now = new Date();
  let hours: number;
  let deliveryTime: string;

  if (isInternational) {
    if (settings) {
      hours = settings.deliveryTimes.international.max;
    } else {
      hours = 6 * 24 * 7; // 6-8 weeks
    }
    deliveryTime = "6-8 weeks by ship";
  } else {
    if (settings) {
      if (city === "Winneba") {
        hours = settings.deliveryTimes.winneba.max;
        deliveryTime = "4hr - 24 hours";
      } else if (["Accra", "Cape Coast", "Takoradi"].includes(city)) {
        hours = settings.deliveryTimes.accraCentral.max;
        deliveryTime = "6hrs to 24hrs";
      } else {
        hours = settings.deliveryTimes.outsideAccraCentral.max;
        deliveryTime = "2 - 5 days";
      }
    } else {
      // Default values
      if (city === "Winneba") {
        hours = 24;
        deliveryTime = "4hr - 24 hours";
      } else if (["Accra", "Cape Coast", "Takoradi"].includes(city)) {
        hours = 24;
        deliveryTime = "6hrs to 24hrs";
      } else {
        hours = 5 * 24;
        deliveryTime = "2 - 5 days";
      }
    }
  }

  const estimatedDelivery = new Date(now.getTime() + hours * 60 * 60 * 1000);
  return { estimatedDelivery, deliveryTime };
}
