// Common validation utilities for email and phone number

// Types
export type InputType = "email" | "phone" | "invalid";

export interface IValidationResult {
  isValid: boolean;
  inputType: InputType;
  formattedValue: string;
  errorMessage?: string;
  helperText?: string;
}

// Email validation regex - standard email format
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

// Phone validation regex - supports multiple formats
// Formats: 9876543210, (987) 654-3210, 987-654-3210, 987.654.3210, 987 654 3210
const PHONE_REGEX = /^\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/;

/**
 * Extract only digits from a string
 */
export const extractDigits = (value: string): string => {
  return value.replace(/\D/g, "");
};

/**
 * Detect input intent for UI (e.g. showing +1 prefix).
 * Uses first-character heuristic: digit = phone, letter/@ = email.
 * For frontend display only; does not affect validation or API payload.
 */
export const detectInputIntent = (input: string): "phone" | "email" | null => {
  const trimmedInput = input.trim();

  if (!trimmedInput) {
    return null;
  }

  if (trimmedInput.includes("@")) {
    return "email";
  }

  const firstChar = trimmedInput[0];
  if (/^\d$/.test(firstChar)) {
    return "phone";
  }

  if (/^[a-zA-Z]/.test(firstChar)) {
    return "email";
  }

  return null;
};

/**
 * Detect if input is email, phone, or invalid
 */
export const detectInputType = (input: string): InputType => {
  const trimmedInput = input.trim();

  // Check if it looks like an email (contains @)
  if (trimmedInput.includes("@")) {
    return "email";
  }

  // Check if it looks like a phone number (has enough digits)
  const digits = extractDigits(trimmedInput);
  if (digits.length >= 10) {
    return "phone";
  }

  return "invalid";
};

/**
 * Validate email format
 */
export const validateEmail = (emailInput: string): IValidationResult => {
  const trimmedEmail = emailInput.trim().toLowerCase();

  if (!trimmedEmail) {
    return {
      isValid: false,
      inputType: "email",
      formattedValue: "",
      errorMessage: "Email address is required",
      helperText: "Please enter your email address",
    };
  }

  if (!EMAIL_REGEX.test(trimmedEmail)) {
    return {
      isValid: false,
      inputType: "email",
      formattedValue: trimmedEmail,
      errorMessage: "Invalid email format",
      helperText: "Please enter a valid email (e.g., user@example.com)",
    };
  }

  // Check for common email mistakes
  if (trimmedEmail.endsWith(".")) {
    return {
      isValid: false,
      inputType: "email",
      formattedValue: trimmedEmail,
      errorMessage: "Invalid email format",
      helperText: "Email cannot end with a period",
    };
  }

  if (trimmedEmail.includes("..")) {
    return {
      isValid: false,
      inputType: "email",
      formattedValue: trimmedEmail,
      errorMessage: "Invalid email format",
      helperText: "Email cannot contain consecutive periods",
    };
  }

  return {
    isValid: true,
    inputType: "email",
    formattedValue: trimmedEmail,
  };
};

/**
 * Validate phone number format (10 digits)
 */
export const validatePhoneNumber = (phoneInput: string): IValidationResult => {
  const trimmedPhone = phoneInput.trim();

  if (!trimmedPhone) {
    return {
      isValid: false,
      inputType: "phone",
      formattedValue: "",
      errorMessage: "Phone number is required",
      helperText: "Please enter your phone number",
    };
  }

  const digits = extractDigits(trimmedPhone);

  // Check for exactly 10 digits
  if (digits.length < 10) {
    return {
      isValid: false,
      inputType: "phone",
      formattedValue: trimmedPhone,
      errorMessage: "Phone number must have 10 digits",
      helperText: "Please enter a valid 10-digit phone number",
    };
  }

  if (digits.length > 10) {
    return {
      isValid: false,
      inputType: "phone",
      formattedValue: trimmedPhone,
      errorMessage: "Phone number must have exactly 10 digits",
      helperText: "Please enter a valid 10-digit phone number",
    };
  }

  // Validate format matches expected patterns
  if (!PHONE_REGEX.test(trimmedPhone)) {
    return {
      isValid: false,
      inputType: "phone",
      formattedValue: trimmedPhone,
      errorMessage: "Invalid phone number format",
      helperText: "Please enter a valid phone number (e.g., 9876543210)",
    };
  }

  // Return plain 10 digits
  return {
    isValid: true,
    inputType: "phone",
    formattedValue: digits,
  };
};

/**
 * Main validation function for email or phone
 * Automatically detects input type and validates accordingly
 */
export const validateEmailOrPhone = (input: string): IValidationResult => {
  const trimmedInput = input.trim();

  if (!trimmedInput) {
    return {
      isValid: false,
      inputType: "invalid",
      formattedValue: "",
      errorMessage: "Email or phone number is required",
      helperText: "Please enter your email address or phone number",
    };
  }

  const inputType = detectInputType(trimmedInput);

  if (inputType === "email") {
    return validateEmail(trimmedInput);
  }

  if (inputType === "phone") {
    return validatePhoneNumber(trimmedInput);
  }

  // If it doesn't look like email or phone
  return {
    isValid: false,
    inputType: "invalid",
    formattedValue: trimmedInput,
    errorMessage: "Invalid input",
    helperText: "Please enter a valid email address or phone number",
  };
};

/**
 * Check if input is a phone number
 */
export const isPhoneInput = (input: string): boolean => {
  return detectInputType(input) === "phone";
};

/**
 * Check if input is an email
 */
export const isEmailInput = (input: string): boolean => {
  return detectInputType(input) === "email";
};

// PayAiro Tag: alphanumeric only (A-Z, a-z, 0-9)
const PAYAIRO_TAG_REGEX = /^[a-zA-Z0-9]+$/;

/**
 * Strip non-alphanumeric characters from input (for real-time filtering)
 */
export const toAlphanumericOnly = (value: string): string => {
  return value.replace(/[^a-zA-Z0-9]/g, "");
};

/**
 * Validate PayAiro Tag format (alphanumeric only, no special characters)
 */
export const validatePayAiroTag = (
  input: string
): { isValid: boolean; errorMessage?: string; helperText?: string } => {
  const trimmed = input.trim();

  if (!trimmed) {
    return {
      isValid: false,
      errorMessage: "PayAiro Tag is required",
      helperText: "Please create your PayAiro Tag",
    };
  }

  if (!PAYAIRO_TAG_REGEX.test(trimmed)) {
    return {
      isValid: false,
      errorMessage: "Invalid PayAiro Tag",
      helperText: "Only letters and numbers allowed (e.g., manjeet123)",
    };
  }

  return { isValid: true };
};
