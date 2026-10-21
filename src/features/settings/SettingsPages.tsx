"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Monitor, Moon, Sun } from "lucide-react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { useState, useSyncExternalStore } from "react";
import { useForm } from "react-hook-form";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { z } from "zod";
import { useAuth } from "@/auth/AuthProvider";
import { PageContainer } from "@/components/layout/PageContainer";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/utils";
import { getPortalRepository } from "@/repositories";

const THEME_OPTIONS = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Monitor },
] as const;

export function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { session, signOut } = useAuth();
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  return (
    <PageContainer title="Settings" description="Appearance and sign-in for this demonstration account.">
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Appearance</CardTitle>
            <CardDescription>Light, dark, or follow this device.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-2">
              {THEME_OPTIONS.map((option) => {
                const Icon = option.icon;
                const active = mounted && theme === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setTheme(option.value)}
                    className={cn(
                      "flex min-h-20 flex-col items-center justify-center gap-2 rounded-xl border border-border px-3 py-4 text-sm hover:bg-muted",
                      active && "border-brand bg-brand-muted text-brand",
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {option.label}
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Sign-in</CardTitle>
            <CardDescription>Signed in as {session?.email}. This is a browser demonstration.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link href="/app/settings/password" className="block text-sm font-medium text-brand">
              Change password
            </Link>
            <Link href="/app/settings/sessions" className="block text-sm font-medium text-brand">
              Active sessions
            </Link>
            <Button variant="danger" onClick={() => signOut()}>
              Logout
            </Button>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Enter your current password."),
    newPassword: z.string().min(8, "Use at least 8 characters.").max(128),
    confirmPassword: z.string().min(8),
  })
  .refine((values) => values.newPassword === values.confirmPassword, {
    message: "Those passwords do not match.",
    path: ["confirmPassword"],
  });

export function PasswordPage() {
  const [blocked, setBlocked] = useState(false);
  const form = useForm<z.infer<typeof passwordSchema>>({
    resolver: zodResolver(passwordSchema),
  });

  return (
    <PageContainer title="Change password" description="The school server does not offer teacher password changes yet.">
      <form
        className="max-w-md space-y-4"
        onSubmit={form.handleSubmit(() => {
          setBlocked(true);
          toast.error("Password change is not available yet. Contact your school administrator.");
        })}
      >
        <Input label="Current password" type="password" error={form.formState.errors.currentPassword?.message} {...form.register("currentPassword")} />
        <Input label="New password" type="password" error={form.formState.errors.newPassword?.message} {...form.register("newPassword")} />
        <Input label="Confirm new password" type="password" error={form.formState.errors.confirmPassword?.message} {...form.register("confirmPassword")} />
        {blocked ? (
          <p className="text-sm text-warning" role="alert">
            Password change is not available yet. Contact your school administrator.
          </p>
        ) : null}
        <Button type="submit">Update password</Button>
      </form>
    </PageContainer>
  );
}

export function SessionsPage() {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: ["sessions"],
    queryFn: () => getPortalRepository().listSessions(),
  });
  const revoke = useMutation({
    mutationFn: (id: string) => getPortalRepository().revokeSession(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["sessions"] });
      toast.success("Removed from this browser list only. The school was not contacted.");
    },
  });

  return (
    <PageContainer title="Active sessions" description="A design fixture of devices. Revoking a row does not sign a real device out.">
      <div className="space-y-3">
        {query.data?.map((session) => (
          <Card key={session.id}>
            <CardContent className="flex items-center justify-between gap-3">
              <div>
                <p className="font-medium">{session.device}</p>
                <p className="text-sm text-muted-foreground">{session.lastSeen}</p>
              </div>
              {session.current ? (
                <Badge variant="brand">This device</Badge>
              ) : (
                <Button variant="outline" onClick={() => revoke.mutate(session.id)}>
                  Sign out
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </PageContainer>
  );
}
