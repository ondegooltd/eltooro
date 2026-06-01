/**
 * Delivery-location helpers shared by checkout, the order API, and the admin
 * settings UI.
 *
 * Delivery fees are stored on the admin settings document as:
 *   deliveryFees: {
 *     cities: [{ name: "Accra", fee: 50 }, ...], // admin-managed (CRUD)
 *     other: 80,        // flat fee for any city not in `cities`
 *     international: 0,  // international shipping fee
 *   }
 *
 * The `cities` list is fully managed by admins from Settings → Delivery, so the
 * defaults below are only used to seed a fresh install / backfill a legacy doc.
 */
export interface DeliveryCity {
  name: string;
  fee: number;
}

/** Default city list used to seed a new install or backfill a legacy document. */
export const DEFAULT_DELIVERY_CITIES: DeliveryCity[] = [
  { name: "Accra", fee: 50 },
  { name: "Tema", fee: 50 },
  { name: "Kasoa", fee: 40 },
  { name: "Madina", fee: 50 },
  { name: "Ashaiman", fee: 50 },
  { name: "Kumasi", fee: 65 },
  { name: "Obuasi", fee: 70 },
  { name: "Cape Coast", fee: 50 },
  { name: "Winneba", fee: 15 },
  { name: "Mankesim", fee: 30 },
  { name: "Takoradi", fee: 50 },
  { name: "Tarkwa", fee: 60 },
  { name: "Koforidua", fee: 55 },
  { name: "Ho", fee: 70 },
  { name: "Sunyani", fee: 70 },
  { name: "Techiman", fee: 75 },
  { name: "Tamale", fee: 90 },
  { name: "Wa", fee: 100 },
  { name: "Bolgatanga", fee: 100 },
];

/**
 * Sentinel value used by the checkout city dropdown for the
 * "my city isn't listed" choice. Not a real city name.
 */
export const OTHER_CITY_VALUE = "__other__";

/** Default flat fee for unlisted cities; admin-editable. */
export const OTHER_CITY_DEFAULT_FEE = 80;

/** Default international shipping fee. */
export const INTERNATIONAL_DEFAULT_FEE = 0;

/**
 * Find the delivery fee for a city by name, case-insensitively and trimming
 * whitespace, so values saved on addresses in any casing still resolve.
 * Returns null when the city is not in the configured list.
 */
export function findCityFee(
  cities: DeliveryCity[] | undefined | null,
  name: string | undefined | null
): number | null {
  if (!cities || !name) return null;
  const normalized = name.trim().toLowerCase();
  const match = cities.find((c) => c.name.trim().toLowerCase() === normalized);
  return match ? match.fee : null;
}

/** Whether the given city name is one of the configured delivery cities. */
export function isListedCity(
  cities: DeliveryCity[] | undefined | null,
  name: string | undefined | null
): boolean {
  return findCityFee(cities, name) !== null;
}
