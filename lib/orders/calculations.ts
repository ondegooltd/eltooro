import { getDb } from "@/lib/db/mongodb";

export interface CartItem {
  productId: string;
  quantity: number;
  price: number;
}

export async function calculateServiceFee(
  items: CartItem[],
  isInternational: boolean
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
  isInternational: boolean
): Promise<number> {
  const db = await getDb();
  const settings = await db.collection("adminsettings").findOne({});

  if (!settings) {
    // Default values
    const defaults: Record<string, number> = {
      Winneba: 15,
      Mankesim: 30,
      Accra: 50,
      "Cape Coast": 50,
      Takoradi: 50,
      Kumasi: 65,
      Sunyani: 70,
    };
    return defaults[city] || 50;
  }

  if (isInternational) {
    return settings.deliveryFees.international || 0;
  }

  const cityMap: Record<string, keyof typeof settings.deliveryFees> = {
    Winneba: "winneba",
    Mankesim: "mankesim",
    Accra: "accra",
    "Cape Coast": "capeCoast",
    Takoradi: "takoradi",
    Kumasi: "kumasi",
    Sunyani: "sunyani",
  };

  const key = cityMap[city];
  return key ? settings.deliveryFees[key] : 50;
}

export async function calculateDeliveryTime(
  city: string,
  isInternational: boolean
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
