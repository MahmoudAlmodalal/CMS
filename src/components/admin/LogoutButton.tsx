'use client';

import React, { useTransition } from "react";
import { signOutAdmin } from "@/actions/auth";
import { Button } from "@/components/ui/Button";

interface LogoutButtonProps {
  className?: string;
  variant?: "primary" | "secondary" | "outline" | "ghost";
}

export function LogoutButton({ className, variant = "outline" }: LogoutButtonProps) {
  const [isPending, startTransition] = useTransition();

  const handleSignOut = () => {
    startTransition(async () => {
      await signOutAdmin();
    });
  };

  return (
    <Button
      type="button"
      variant={variant}
      size="sm"
      isLoading={isPending}
      disabled={isPending}
      onClick={handleSignOut}
      className={className}
    >
      تسجيل الخروج
    </Button>
  );
}
