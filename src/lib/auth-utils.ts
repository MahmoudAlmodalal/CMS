/**
 * Task 27 — Admin Authentication Utilities
 * Defense against open redirects and uniform localized error handling.
 */

export const AUTH_ERRORS = {
  INVALID_CREDENTIALS: "البريد الإلكتروني أو كلمة المرور غير صحيحة",
  SESSION_EXPIRED: "انتهت الجلسة، يرجى تسجيل الدخول مجددًا",
  UNAUTHORIZED: "غير مصرح لك بالدخول إلى لوحة التحكم",
  MISSING_CREDENTIALS: "يرجى إدخال البريد الإلكتروني وكلمة المرور",
} as const;

/**
 * Validates and sanitizes destination URL to prevent open redirect vulnerabilities.
 * Allows only safe relative paths beginning with a single '/' without protocol or backslashes.
 */
export function getSafeRedirectUrl(target: string | null | undefined): string {
  if (!target || typeof target !== "string") {
    return "/admin";
  }

  const trimmed = target.trim();

  // Must start with '/' and must not start with '//' or '/\'
  if (!trimmed.startsWith("/") || trimmed.startsWith("//") || trimmed.startsWith("/\\")) {
    return "/admin";
  }

  // Must not contain protocol schemes (e.g., "javascript:", "https:", "data:")
  if (trimmed.includes(":") || trimmed.includes("\\")) {
    return "/admin";
  }

  // Ensure it does not contain whitespace or control characters
  if (/[\s\u0000-\u001F\u007F-\u009F]/.test(trimmed)) {
    return "/admin";
  }

  return trimmed;
}
