import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";
import { Suspense } from "react";

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-j-background py-12 px-4">
      <div className="w-full flex justify-center">
        <Suspense fallback={
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-j-border border-t-jumia-orange rounded-full animate-spin" />
            <p className="text-xs font-bold uppercase text-j-text-muted">Loading...</p>
          </div>
        }>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}
