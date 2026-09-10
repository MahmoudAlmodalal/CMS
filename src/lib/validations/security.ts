import { z } from "zod";

// ============================================================================
// Authorization & Role Validation (AUTH_ARCHITECTURE.md / SECURITY_MODEL.md)
// ============================================================================

export type UserRole = "anonymous" | "authenticated" | "admin" | "service_role";

export interface AuthValidationResult {
  authorized: boolean;
  role?: string;
  error?: string;
}

/**
 * Validates that the executing context possesses an approved role for protected mutations.
 * Public visitors ('anonymous') are rejected from invoking CMS writes.
 */
export function validateUserRole(
  currentRole: string | null | undefined,
  allowedRoles: readonly string[] = ["admin", "service_role"]
): AuthValidationResult {
  if (!currentRole) {
    return {
      authorized: false,
      error: "غير مصرح: لم يتم العثور على جلسة مستخدم صالحة",
    };
  }

  const normalizedRole = currentRole.trim().toLowerCase();
  if (!allowedRoles.includes(normalizedRole)) {
    return {
      authorized: false,
      role: normalizedRole,
      error: `غير مصرح: الدور "${normalizedRole}" لا يملك صلاحيات تعديل المحتوى`,
    };
  }

  return {
    authorized: true,
    role: normalizedRole,
  };
}

// ============================================================================
// Uniqueness & Collision Checking (Slugs & Emails)
// ============================================================================

export interface DuplicateCheckResult {
  isDuplicate: boolean;
  field: string;
  value: string;
  error?: string;
}

/**
 * Checks whether a candidate slug collides with existing items.
 * If editing an existing item (matching currentId), the self-collision is ignored.
 */
export function checkDuplicateSlug(
  candidateSlug: string,
  existingItems: readonly { id?: string; slug: string }[],
  currentId?: string
): DuplicateCheckResult {
  const normalizedCandidate = candidateSlug.trim().toLowerCase();

  const match = existingItems.find((item) => {
    if (currentId && item.id === currentId) {
      return false; // same entity being edited
    }
    return item.slug.trim().toLowerCase() === normalizedCandidate;
  });

  if (match) {
    return {
      isDuplicate: true,
      field: "slug",
      value: candidateSlug,
      error: `المعرف اللطيف (slug) "${candidateSlug}" مستخدم بالفعل، يرجى اختيار معرف آخر`,
    };
  }

  return {
    isDuplicate: false,
    field: "slug",
    value: candidateSlug,
  };
}

/**
 * Checks whether an email address collides with existing subscribers or records.
 */
export function checkDuplicateEmail(
  candidateEmail: string,
  existingItems: readonly { id?: string; email: string }[],
  currentId?: string
): DuplicateCheckResult {
  const normalizedCandidate = candidateEmail.trim().toLowerCase();

  const match = existingItems.find((item) => {
    if (currentId && item.id === currentId) {
      return false;
    }
    return item.email.trim().toLowerCase() === normalizedCandidate;
  });

  if (match) {
    return {
      isDuplicate: true,
      field: "email",
      value: candidateEmail,
      error: `البريد الإلكتروني "${candidateEmail}" مسجل مسبقاً في النظام`,
    };
  }

  return {
    isDuplicate: false,
    field: "email",
    value: candidateEmail,
  };
}

// ============================================================================
// Repeated Submissions & Anti-Replay Guard (In-Memory Sliding Window)
// ============================================================================

export class SubmissionDeduplicator {
  private static timestamps: Map<string, number> = new Map();

  /**
   * Generates a deterministic submission fingerprint key.
   */
  public static createFingerprint(prefix: string, payload: unknown): string {
    const serialized = JSON.stringify(payload, Object.keys(payload as object || {}).sort());
    return `${prefix}:${serialized}`;
  }

  /**
   * Checks whether a submission with this fingerprint occurred within the cooldown window.
   */
  public static isRepeated(key: string, cooldownMs: number = 60_000): boolean {
    const now = Date.now();
    const last = this.timestamps.get(key);
    if (!last) return false;
    if (now - last < cooldownMs) {
      return true;
    }
    this.timestamps.delete(key);
    return false;
  }

  /**
   * Records a submission timestamp and purges old entries.
   */
  public static record(key: string): void {
    const now = Date.now();
    this.timestamps.set(key, now);

    // Housekeeping: remove entries older than 5 minutes
    if (this.timestamps.size > 500) {
      const expiry = now - 300_000;
      for (const [k, ts] of this.timestamps.entries()) {
        if (ts < expiry) {
          this.timestamps.delete(k);
        }
      }
    }
  }

  /**
   * Clears all recorded submissions (useful for test isolation).
   */
  public static reset(): void {
    this.timestamps.clear();
  }
}

// ============================================================================
// Zod Error Formatting & Safe Validation Helpers
// ============================================================================

export interface FormattedErrors {
  fieldErrors: Record<string, string[]>;
  formErrors: string[];
  firstError: string;
}

export function formatZodErrors(error: z.ZodError): FormattedErrors {
  const fieldErrors: Record<string, string[]> = {};
  const formErrors: string[] = [];

  for (const issue of error.issues) {
    const path = issue.path.join(".");
    if (path) {
      if (!fieldErrors[path]) {
        fieldErrors[path] = [];
      }
      fieldErrors[path].push(issue.message);
    } else {
      formErrors.push(issue.message);
    }
  }

  const firstIssue = error.issues[0];
  const firstError = firstIssue ? firstIssue.message : "بيانات غير صالحة";

  return {
    fieldErrors,
    formErrors,
    firstError,
  };
}

export type SafeValidationResult<T> =
  | { success: true; data: T }
  | { success: false; errors: Record<string, string[]>; error: string };

/**
 * Validates untrusted input payload against a Zod schema with uniform error response.
 */
export function safeValidate<T>(
  schema: z.ZodType<T>,
  data: unknown
): SafeValidationResult<T> {
  const result = schema.safeParse(data);
  if (result.success) {
    return {
      success: true,
      data: result.data,
    };
  }

  const formatted = formatZodErrors(result.error);
  return {
    success: false,
    errors: formatted.fieldErrors,
    error: formatted.firstError,
  };
}
