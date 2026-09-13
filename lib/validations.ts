export function sanitizeString(val: unknown, maxLength?: number): string {
  if (typeof val !== "string") return "";
  const trimmed = val.trim();
  if (maxLength && trimmed.length > maxLength) {
    return trimmed.slice(0, maxLength);
  }
  return trimmed;
}

export function isValidEmail(email: string): boolean {
  if (!email || typeof email !== "string") return false;
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email.trim().toLowerCase());
}

export function validateEmail(email: string): string {
  if (!email || typeof email !== "string") {
    throw new Error("Email is required.");
  }
  const clean = email.trim().toLowerCase();
  if (!isValidEmail(clean)) {
    throw new Error("Invalid email format.");
  }
  return clean;
}

export function validatePassword(password: unknown): {
  valid: boolean;
  error?: string;
} {
  if (typeof password !== "string" || !password) {
    return { valid: false, error: "Password is required." };
  }
  if (password.length < 6) {
    return {
      valid: false,
      error: "Password must be at least 6 characters.",
    };
  }
  return { valid: true };
}

export type AddressInput = {
  fullName: string;
  line1: string;
  line2?: string;
  city: string;
  state?: string;
  postalCode: string;
  country?: string;
  phone?: string;
};

export function validateAddress(data: unknown): {
  valid: boolean;
  data?: AddressInput;
  error?: string;
} {
  if (!data || typeof data !== "object") {
    return { valid: false, error: "Invalid address data." };
  }

  const raw = data as Record<string, unknown>;
  const fullName = sanitizeString(raw.fullName);
  const line1 = sanitizeString(raw.line1);
  const line2 = sanitizeString(raw.line2);
  const city = sanitizeString(raw.city);
  const state = sanitizeString(raw.state);
  const postalCode = sanitizeString(raw.postalCode);
  const country = sanitizeString(raw.country) || "India";
  const phone = sanitizeString(raw.phone);

  if (!fullName) {
    return { valid: false, error: "Full name is required." };
  }
  if (!line1) {
    return { valid: false, error: "Address line 1 is required." };
  }
  if (!city) {
    return { valid: false, error: "City is required." };
  }
  if (!postalCode) {
    return { valid: false, error: "Postal code is required." };
  }

  return {
    valid: true,
    data: {
      fullName,
      line1,
      line2: line2 || undefined,
      city,
      state: state || undefined,
      postalCode,
      country,
      phone: phone || undefined,
    },
  };
}

export function normalizeCouponCode(code: unknown): string {
  if (typeof code !== "string") return "";
  return code.trim().toUpperCase();
}

export function validateCouponCode(code: unknown): string {
  const normalized = normalizeCouponCode(code);
  if (!normalized) {
    throw new Error("Coupon code is required.");
  }
  return normalized;
}
