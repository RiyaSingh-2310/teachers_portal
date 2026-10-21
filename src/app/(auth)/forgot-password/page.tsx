import { ForgotPasswordForm } from "@/features/auth/ForgotPasswordForm";
import { APP_NAME } from "@/config/app";

export default function ForgotPasswordPage() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-background px-4 py-10">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
        <div className="mb-6 space-y-1">
          <p className="text-sm font-semibold text-brand">{APP_NAME}</p>
          <h1 className="text-2xl font-semibold tracking-tight">Reset password</h1>
          <p className="text-sm text-muted-foreground">
            A reset link needs a school endpoint that does not exist yet.
          </p>
        </div>
        <ForgotPasswordForm />
      </div>
    </div>
  );
}
