import { z } from "zod";

// Shared scalars
export const UUID = z.string().uuid("Invalid ID");
export const amount = z.coerce.number().gt(0, "Amount must be positive");
// add proper email validation
export const email = z.string().email("Invalid email address");
// add proper phone number 10 digit validation
export const phoneNumber = z
  .string()
  .regex(/^\d{10}$/, "Phone number must be 10 digits.");

const stripControlChars = (s: string) =>
  s.replace(/[\u0000-\u001F\u007F]/g, " ");

export const safeNameRegex = /^[a-zA-Z0-9 .,_-]+$/;

export const safeName = z
  .string()
  .trim()
  .min(1, "Name is required")
  .max(100, "Name too long")
  .regex(safeNameRegex, "Invalid characters");

export const safeToken = z
  .string()
  .trim()
  .min(1, "Token is required")
  .max(400, "Token too long")
  .regex(safeNameRegex, "Invalid characters");

export const safeUsername = z
  .string()
  .trim()
  .min(3, "username is required")
  .max(100, "username too long")
  .regex(safeNameRegex, "Invalid characters");

export const safeText = z
  .string()
  .min(1, "Text is required")
  .max(1000, "Text too long")
  .transform((s) => stripControlChars(s.trim()));

export const safeOptionalText = z
  .string()
  .max(1000, "Text too long")
  .regex(safeNameRegex, "Invalid characters")
  .transform((s) => stripControlChars(s.trim()))
  .optional();

export function deepSanitize(input: unknown): unknown {
  if (typeof input === "string") return stripControlChars(input.trim());
  if (Array.isArray(input)) return input.map(deepSanitize);
  if (input && typeof input === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(input)) out[k] = deepSanitize(v);
    return out;
  }
  return input;
}

// Ensure objects reject unknown keys
export function ensureStrict<T extends z.ZodTypeAny>(schema: T): T {
  if (schema instanceof z.ZodObject) {
    return schema.strict() as unknown as T;
  }
  return schema;
}

export const unique = <T, K extends keyof any>(arr: T[], by?: (v: T) => K) => {
  const set = new Set<K>();
  for (const v of arr) {
    const k = by ? by(v) : (v as unknown as K);
    if (set.has(k)) return false;
    set.add(k);
  }
  return true;
};

export const password = z
  .string()
  .min(8, "Password must be at least 8 characters long.")
  .max(128, "Password must be at most 128 characters long.")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter.")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter.")
  .regex(/[0-9]/, "Password must contain at least one number.")
  // .regex(
  //   /[^A-Za-z0-9]/,
  //   "Password must contain at least one special character."
  // )
  .refine((val) => !/\s/.test(val), {
    message: "Password must not contain spaces.",
  })
  .transform((s) => s.trim());
