import { parsePhoneNumber, isValidPhoneNumber } from "libphonenumber-js";

export function normalizePhoneNumber(phone: string): string {
  try {
    // Try to parse as Ghana number
    const phoneNumber = parsePhoneNumber(phone, "GH");
    if (phoneNumber.isValid()) {
      return phoneNumber.format("E.164");
    }
  } catch (error) {
    // If parsing fails, try to add country code if missing
    if (phone.startsWith("0")) {
      // Local format like 020XXXXXXX or 024XXXXXXX
      const withoutLeadingZero = phone.substring(1);
      return `+233${withoutLeadingZero}`;
    }
    if (!phone.startsWith("+")) {
      return `+233${phone}`;
    }
  }

  // If all else fails, validate and return as is
  if (isValidPhoneNumber(phone)) {
    const phoneNumber = parsePhoneNumber(phone);
    return phoneNumber.format("E.164");
  }

  throw new Error("Invalid phone number format");
}

export function validatePhoneNumber(phone: string): boolean {
  try {
    return isValidPhoneNumber(phone, "GH") || isValidPhoneNumber(phone);
  } catch {
    return false;
  }
}
