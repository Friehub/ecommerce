import { ResetPasswordForm } from "../../../components/auth/ResetPasswordForm";
import { Suspense } from "react";

export default function ResetPasswordPage() {
 return (
 <div className="min-h-screen flex items-center justify-center bg-background py-12 px-4 relative overflow-hidden">
 {/* Background Decor */}
 <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-primary-container/5 rounded-full blur-[180px] -translate-x-1/3 -translate-y-1/3" />
 <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-primary-container/5 rounded-full blur-[180px] translate-x-1/3 translate-y-1/3" />

 <div className="relative z-10 w-full flex justify-center">
 <Suspense fallback={
 <div className="flex flex-col items-center gap-6">
 <div className="w-16 h-16 border-4 border-primary-container/20 border-t-primary-container rounded-full animate-spin" />
 <p className="text-[10px] font-black uppercase tracking-[0.4em] text-on-surface-variant opacity-40">Synchronizing Security Nodes</p>
 </div>
 }>
 <ResetPasswordForm />
 </Suspense>
 </div>
 </div>
 );
}
