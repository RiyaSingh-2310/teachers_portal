"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { useAuth } from "@/auth/AuthProvider";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { FIXTURE_EMAIL, FIXTURE_PASSWORD } from "@/config/app";
import { PortalError } from "@/lib/api/errors";
import Link from "next/link";

const schema = z.object({
  email: z.string().email("Enter a valid email address."),
  password: z.string().min(8, "Password must be at least 8 characters.").max(128),
  remember: z.boolean(),
});

type FormValues = z.infer<typeof schema>;

export function LoginForm() {
  const { signIn } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "", remember: true },
  });

  async function onSubmit(values: FormValues) {
    setFormError(null);
    try {
      await signIn(values.email, values.password, values.remember);
      toast.success("Demonstration session started");
      const next = searchParams.get("next");
      router.replace(next?.startsWith("/app") ? next : "/app");
    } catch (error) {
      const message =
        error instanceof PortalError ? error.message : "Unable to sign in. Please try again.";
      setFormError(message);
      toast.error(message);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <Input
        label="Email address"
        type="email"
        autoComplete="username"
        placeholder="you@school.edu"
        error={errors.email?.message}
        {...register("email")}
      />
      <div className="relative">
        <Input
          label="Password"
          type={showPassword ? "text" : "password"}
          autoComplete="current-password"
          placeholder="Enter your password"
          error={errors.password?.message}
          {...register("password")}
        />
        <button
          type="button"
          className="absolute top-[2.35rem] right-3 text-muted-foreground hover:text-foreground"
          onClick={() => setShowPassword((value) => !value)}
          aria-label={showPassword ? "Hide password" : "Show password"}
        >
          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
      <div className="flex items-center justify-between gap-3 text-sm">
        <label className="inline-flex items-center gap-2 text-muted-foreground">
          <input type="checkbox" className="size-4 rounded border-input" {...register("remember")} />
          Remember me
        </label>
        <Link href="/forgot-password" className="font-medium text-brand hover:underline">
          Forgot password?
        </Link>
      </div>
      {formError ? (
        <p className="text-sm text-danger" role="alert">
          {formError}
        </p>
      ) : null}
      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? "Signing in…" : "Sign In"}
      </Button>
      <p className="rounded-lg bg-info-muted px-3 py-2 text-xs text-info">
        Design fixture, not a school account. This check stays in the browser: {FIXTURE_EMAIL} / {FIXTURE_PASSWORD}
      </p>
      <p className="text-center text-xs text-muted-foreground">
        Need a login? Ask your school administrator. This portal cannot create accounts.
      </p>
    </form>
  );
}
