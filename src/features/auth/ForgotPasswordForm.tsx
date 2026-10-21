"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

const schema = z.object({
  email: z.string().email("Enter a valid email address."),
});

export function ForgotPasswordForm() {
  const [unavailable, setUnavailable] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<{ email: string }>({ resolver: zodResolver(schema) });

  return (
    <form
      className="space-y-4"
      onSubmit={handleSubmit(() => setUnavailable(true))}
      noValidate
    >
      <Input
        label="Email address"
        type="email"
        placeholder="you@school.edu"
        error={errors.email?.message}
        {...register("email")}
      />
      {unavailable ? (
        <p className="rounded-lg bg-warning-muted px-3 py-2 text-sm text-warning" role="status">
          Password reset is not available yet. Contact your school administrator.
        </p>
      ) : null}
      <Button type="submit" className="w-full" disabled={isSubmitting}>
        Send reset link
      </Button>
      <Link href="/login" className="block text-center text-sm font-medium text-brand hover:underline">
        Back to sign in
      </Link>
    </form>
  );
}
