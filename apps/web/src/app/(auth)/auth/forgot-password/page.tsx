import { ForgotPasswordForm } from "../../../components/auth/ForgotPasswordForm";

export default function ForgotPasswordPage() {
 return (
 <div className="min-h-screen flex items-center justify-center bg-background py-12 px-4 relative overflow-hidden">
 {/* Background Decor */}
 <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary-container/5 rounded-full blur-[150px] translate-x-1/3 -translate-y-1/3" />
 <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-primary-container/5 rounded-full blur-[150px] -translate-x-1/3 translate-y-1/3" />
 
 <div className="relative z-10 w-full flex justify-center">
 <ForgotPasswordForm />
 </div>
 </div>
 );
}
