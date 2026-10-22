import { Suspense } from "react";
import { LoginForm } from "@/features/auth/LoginForm";
import { APP_NAME, APP_SHORT_NAME } from "@/config/app";

export const instant = false;

export default function LoginPage() {
  return (
    <div className="grid min-h-dvh lg:grid-cols-2">
      <section className="relative hidden overflow-hidden bg-[radial-gradient(circle_at_top_left,#4f46e5,transparent_45%),radial-gradient(circle_at_bottom_right,#0d9488,transparent_40%),linear-gradient(160deg,#1e1b4b,#312e81)] p-10 text-white lg:flex lg:flex-col lg:justify-between">
        <div>
          <p className="text-sm font-semibold tracking-[0.2em] uppercase opacity-80">{APP_SHORT_NAME}</p>
          <h1 className="mt-6 max-w-md text-4xl font-semibold leading-tight">
            Your classes, your day, in one place.
          </h1>
          <p className="mt-4 max-w-md text-base text-indigo-100">
            See today’s periods, the students you teach, and the work still open — without the admin console.
          </p>
        </div>
        <div className="rounded-2xl border border-white/15 bg-white/10 p-5 backdrop-blur">
          <p className="text-sm font-medium">Built for teachers</p>
          <p className="mt-1 text-sm text-indigo-100">
            Assigned classes only · School-managed accounts · Separate from the Admin Portal
          </p>
        </div>
      </section>
      <section className="flex items-center justify-center bg-background px-4 py-10">
        <div className="w-full max-w-md">
          <div className="mb-6 rounded-2xl bg-[linear-gradient(160deg,#1e1b4b,#312e81)] p-5 text-white lg:hidden">
            <p className="text-xs font-semibold tracking-[0.2em] uppercase opacity-80">{APP_SHORT_NAME}</p>
            <p className="mt-2 text-lg font-semibold leading-snug">Your classes, your day, in one place.</p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
          <div className="mb-6 space-y-1">
            <p className="text-sm font-semibold text-brand">{APP_NAME}</p>
            <h2 className="text-2xl font-semibold tracking-tight">Welcome back</h2>
            <p className="text-sm text-muted-foreground">Sign in with your school email.</p>
          </div>
          <Suspense fallback={<div className="h-64 animate-pulse rounded-xl bg-muted" />}>
            <LoginForm />
          </Suspense>
          </div>
        </div>
      </section>
    </div>
  );
}
