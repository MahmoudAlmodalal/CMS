'use client';

import React, { useActionState } from "react";
import { signInAdmin, type AuthActionState } from "@/actions/auth";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

interface LoginFormProps {
  initialNext?: string;
  initialError?: string;
}

export function LoginForm({ initialNext = "/admin", initialError }: LoginFormProps) {
  const initialState: AuthActionState = {
    error: initialError || null,
  };

  const [state, formAction, isPending] = useActionState(signInAdmin, initialState);

  return (
    <form action={formAction} className="space-y-5 w-full">
      <input type="hidden" name="next" value={initialNext} />

      {state.error && (
        <div
          role="alert"
          aria-live="assertive"
          className="p-3.5 rounded-card bg-alert-error/10 border border-alert-error/30 text-alert-error text-sm font-medium text-center"
        >
          {state.error}
        </div>
      )}

      <div className="space-y-2 text-start">
        <label
          htmlFor="email"
          className="block text-sm font-bold text-brand-espresso"
        >
          البريد الإلكتروني
        </label>
        <Input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="admin@andalusia.art"
          disabled={isPending}
          className="text-start dir-ltr"
        />
      </div>

      <div className="space-y-2 text-start">
        <label
          htmlFor="password"
          className="block text-sm font-bold text-brand-espresso"
        >
          كلمة المرور
        </label>
        <Input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          placeholder="••••••••"
          disabled={isPending}
        />
      </div>

      <Button
        type="submit"
        variant="primary"
        size="md"
        isLoading={isPending}
        disabled={isPending}
        className="w-full mt-2"
      >
        {isPending ? "جاري تسجيل الدخول..." : "تسجيل الدخول"}
      </Button>
    </form>
  );
}
