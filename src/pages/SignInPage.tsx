import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowRight, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { Logo } from '@/components/Logo';

export function SignInPage() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error: signInError } = await signIn(email, password);

    if (signInError) {
      setError(signInError);
      setLoading(false);
    } else {
      navigate('/dashboard', { replace: true });
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-ink-50">
      <div className="container-page flex h-16 items-center">
        <Link to="/" className="inline-flex items-center gap-2 text-sm font-medium text-ink-500 hover:text-ink-800">
          <ArrowLeft size={16} />
          Back to Home
        </Link>
      </div>
      <div className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="mb-8 flex justify-center">
            <Logo />
          </div>

          <Card className="p-8">
            <h1 className="text-2xl font-bold text-ink-900">Welcome back</h1>
            <p className="mt-2 text-sm text-ink-500">
              Sign in to your BoardSpot account
            </p>

            {error && (
              <div className="mt-4 rounded-lg border border-error-500/20 bg-error-500/5 px-4 py-3">
                <p className="text-sm text-error-600">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div>
                <label className="text-sm font-medium text-ink-700">Email</label>
                <div className="relative mt-1.5">
                  <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full rounded-lg border border-ink-300 bg-white py-2.5 pl-10 pr-3 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-ink-700">Password</label>
                <div className="relative mt-1.5">
                  <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-lg border border-ink-300 bg-white py-2.5 pl-10 pr-3 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
                  />
                </div>
              </div>

              <Button type="submit" size="lg" className="w-full" loading={loading}>
                Sign In
                <ArrowRight size={18} />
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-ink-500">
              Don't have an account?{' '}
              <Link to="/signup" className="font-medium text-brand-600 hover:text-brand-700">
                Sign up
              </Link>
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
