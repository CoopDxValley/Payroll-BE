/**
 * Formats an Ethiopian phone number into the format required by the SMS API:
 * either starting with 9XXXXXXXX or 7XXXXXXXX (i.e., no country code or '+' sign).
 *
 * Example:
 * +251911123456 → 911123456
 * 0911123456    → 911123456
 * 251911123456  → 911123456
 * 911123456     → 911123456 (already valid)
 *
 * Returns null if the number can't be parsed safely.
 */
export function formatPhoneNumberForSms(phone: string): string | null {
  // Remove all non-digit characters
  let digits = phone.replace(/\D/g, "");

  // If starts with country code (e.g., 251911123456)
  if (digits.startsWith("251") && digits.length === 12) {
    return digits.slice(3); // Remove '251'
  }

  // If starts with 0 (e.g., 0911123456)
  if (digits.startsWith("0") && digits.length === 10) {
    return digits.slice(1); // Remove '0'
  }

  // If already in correct format (9xxxxxxxx or 7xxxxxxxx)
  if (/^[79]\d{8}$/.test(digits)) {
    return digits;
  }

  // Unrecognized format
  return null;
}
