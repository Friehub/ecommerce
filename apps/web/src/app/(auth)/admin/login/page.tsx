'use client';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function AdminMFALoginPage() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mfaCode, setMfaCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 1 && email && password) {
      setStep(2);
    }
  };

  const handleFinalLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError('Unauthorized administrative access');
        setStep(1);
      } else {
        router.push('/dashboard');
        router.refresh();
      }
    } catch (err) {
      setError('An error occurred during verification');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-j-background flex flex-col justify-center items-center py-12 px-4">
      <div className="w-full max-w-md bg-white rounded-sm shadow-lg border border-j-border overflow-hidden">
        <div className="p-8 md:p-12">
          <div className="flex justify-center mb-8">
            <div className="w-16 h-16 bg-j-text text-white rounded flex items-center justify-center shadow-lg">
              <ShieldCheck size={32} />
            </div>
          </div>

          <div className="text-center mb-8">
            <h1 className="text-2xl font-black text-j-text uppercase tracking-tight">Admin <span className="text-jumia-orange">Login</span></h1>
            <p className="text-xs font-bold text-j-text-muted uppercase mt-2">Secure Administration Area</p>
          </div>

          {error && (
            <div className="bg-red-50 text-j-error p-4 rounded-sm text-xs font-medium border border-j-error/20 mb-6 text-center">
              {error}
            </div>
          )}

          {step === 1 ? (
            <form onSubmit={handleNextStep} className="space-y-4">
              <Input 
                label="Admin Email"
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@jumia.com"
              />

              <Input 
                label="Password"
                type="password" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
              />

              <Button 
                type="submit"
                className="w-full h-14 mt-6 text-sm font-bold uppercase tracking-wider"
              >
                Proceed to MFA <ArrowRight size={18} className="ml-2" />
              </Button>
            </form>
          ) : (
            <form onSubmit={handleFinalLogin} className="space-y-6">
              <div className="space-y-4">
                <label className="text-xs font-bold uppercase text-j-text-muted text-center block">
                  Authenticator MFA Code
                </label>
                <input 
                  type="text" 
                  required
                  maxLength={6}
                  value={mfaCode}
                  onChange={(e) => setMfaCode(e.target.value)}
                  placeholder="000 000"
                  className="w-full h-16 bg-j-surface-container-low border border-j-border rounded-sm px-6 text-center text-2xl font-black text-j-text focus:border-jumia-orange transition-all outline-none"
                  autoFocus
                />
                <p className="text-[10px] text-j-text-muted font-bold text-center mt-4 leading-relaxed uppercase tracking-wider">
                  Enter the 6-digit MFA code from your authenticator app.
                </p>
              </div>

              <Button 
                type="submit"
                isLoading={loading}
                className="w-full h-14 mt-6 text-sm font-bold uppercase tracking-wider"
              >
                Verify & Login
              </Button>

              <button 
                type="button"
                onClick={() => setStep(1)}
                className="w-full text-center text-xs text-j-text-muted font-bold hover:text-jumia-orange transition-all uppercase mt-4"
              >
                Back to Login
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
