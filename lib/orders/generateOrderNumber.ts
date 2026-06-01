import { getDb } from "@/lib/db/mongodb";

export async function generateOrderNumber(
  prefix: string = "ORD"
): Promise<string> {
  const db = await getDb();
  const date = new Date();
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, "");

  // Generate random 5-digit number
  let random: string;
  let orderNumber: string;
  let exists: boolean;

  do {
    random = Math.floor(Math.random() * 100000)
      .toString()
      .padStart(5, "0");
    orderNumber = `${prefix}-${dateStr}-${random}`;

    // Check if order number already exists
    exists = !!(await db.collection("orders").findOne({ orderNumber }));
  } while (exists);

  return orderNumber;
}
