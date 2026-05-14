import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export const ResetPasswordForm = () => {
  const [password, setPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [submitted, setSubmitted] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const resetPassword = api.iam.resetPassword.useMutation({
    onSuccess: () => {
      setSubmitted(true);
      setLoading(false);
    },
    onError: (err) => {
      setError(err.message || 'An error occurred. Please try again.');
      setLoading(false);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (!token) {
      setError('Invalid or missing reset token');
      return;
    }
    setLoading(true);
    setError('');
    resetPassword.mutate({ token, newPassword: password });
  };

  if (submitted) {
    return (
      <div className="bg-white p-12 rounded-sm border border-j-border shadow-lg w-full max-w-[480px] text-center">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-green-50 text-green-600 rounded-full flex items-center justify-center border border-green-200">
            <CheckCircle2 size={32} />
          </div>
        </div>
        <h1 className="text-2xl font-black text-j-text mb-2 uppercase tracking-tight">Password <span className="text-green-600">Updated</span></h1>
        <p className="text-xs font-bold text-j-text-muted uppercase mb-8 leading-relaxed">
          Your password has been successfully updated. You can now login with your new credentials.
        </p>
        <Link href="/login" className="block">
          <Button className="w-full h-14">
            Proceed to Login <ArrowRight size={20} className="ml-2" />
          </Button>
        </Link>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="bg-white p-12 rounded-sm border border-j-border shadow-lg w-full max-w-[480px] text-center">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-red-50 text-j-error rounded-full flex items-center justify-center border border-red-200">
            <ShieldAlert size={32} />
          </div>
        </div>
        <h1 className="text-2xl font-black text-j-text mb-2 uppercase tracking-tight">Invalid <span className="text-j-error">Link</span></h1>
        <p className="text-xs font-bold text-j-text-muted uppercase mb-8 leading-relaxed">
          The password reset link is invalid or has expired.
        </p>
        <Link 
          href="/auth/forgot-password" 
          className="text-jumia-orange font-bold uppercase text-xs hover:underline"
        >
          Request a new link
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white p-8 md:p-12 rounded-sm border border-j-border shadow-lg w-full max-w-[480px]">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 bg-jumia-orange/10 rounded flex items-center justify-center text-jumia-orange">
          <Fingerprint size={28} />
        </div>
        <div>
          <h1 className="text-xl font-black text-j-text uppercase tracking-tight">Reset <span className="text-jumia-orange">Password</span></h1>
          <p className="text-[10px] font-bold text-j-text-muted uppercase mt-1">Enter your new password</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-50 text-j-error p-3 rounded-sm text-xs font-medium border border-j-error/20 mb-6 text-center">
            {error}
          </div>
        )}

        <Input
          label="New Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••••••"
          required
          minLength={8}
        />

        <Input
          label="Confirm Password"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="••••••••••••"
          required
          minLength={8}
        />

        <Button
          type="submit"
          isLoading={loading}
          className="w-full h-14 mt-6 text-sm font-bold uppercase tracking-wider"
        >
          Update Password
        </Button>
      </form>
    </div>
  );
};
};
