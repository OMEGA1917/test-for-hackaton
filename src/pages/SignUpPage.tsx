import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, ArrowRight, ArrowLeft, Building2, Megaphone } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Logo } from '@/components/Logo';
import type { UserRole } from '@/types';
import { cn } from '@/utils/cn';

export function SignUpPage() {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('advertiser');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [awaitingConfirmation, setAwaitingConfirmation] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    const { error: signUpError, needsConfirmation } = await signUp(email, password, fullName, role);

    setLoading(false);
    if (signUpError) {
      setError(signUpError);
    } else if (needsConfirmation) {
      setAwaitingConfirmation(true);
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

          {awaitingConfirmation ? (
            <Card className="p-8 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-brand-50 text-brand-600">
                <Mail size={26} />
              </div>
              <h1 className="mt-4 text-2xl font-bold text-ink-900">Check your email</h1>
              <p className="mt-2 text-sm text-ink-500">
                We sent a confirmation link to <span className="font-medium text-ink-800">{email}</span>.
                Click it to activate your account, then sign in.
              </p>
              <Link to="/signin" className="mt-6 inline-block">
                <Button>Go to sign in</Button>
              </Link>
            </Card>
          ) : (
          <Card className="p-8">
            <h1 className="text-2xl font-bold text-ink-900">Create your account</h1>
            <p className="mt-2 text-sm text-ink-500">
              Join BoardSpot as an advertiser or billboard owner
            </p>

            {error && (
              <div className="mt-4 rounded-lg border border-error-500/20 bg-error-500/5 px-4 py-3">
                <p className="text-sm text-error-600">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              {/* Role selection */}
              <div>
                <label className="text-sm font-medium text-ink-700">I want to…</label>
                <div className="mt-2 grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setRole('advertiser')}
                    className={cn(
                      'flex flex-col items-center gap-2 rounded-lg border-2 p-4 transition-colors',
                      role === 'advertiser'
                        ? 'border-brand-500 bg-brand-50'
                        : 'border-ink-200 hover:border-ink-300',
                    )}
                  >
                    <Megaphone size={24} className={role === 'advertiser' ? 'text-brand-600' : 'text-ink-400'} />
                    <span className={cn('text-sm font-medium', role === 'advertiser' ? 'text-brand-700' : 'text-ink-600')}>
                      Advertise
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('owner')}
                    className={cn(
                      'flex flex-col items-center gap-2 rounded-lg border-2 p-4 transition-colors',
                      role === 'owner'
                        ? 'border-brand-500 bg-brand-50'
                        : 'border-ink-200 hover:border-ink-300',
                    )}
                  >
                    <Building2 size={24} className={role === 'owner' ? 'text-brand-600' : 'text-ink-400'} />
                    <span className={cn('text-sm font-medium', role === 'owner' ? 'text-brand-700' : 'text-ink-600')}>
                      List Billboards
                    </span>
                  </button>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-ink-700">Full Name</label>
                <div className="relative mt-1.5">
                  <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="John Doe"
                    className="w-full rounded-lg border border-ink-300 bg-white py-2.5 pl-10 pr-3 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
                  />
                </div>
              </div>

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
                    placeholder="At least 6 characters"
                    className="w-full rounded-lg border border-ink-300 bg-white py-2.5 pl-10 pr-3 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
                  />
                </div>
              </div>

              <Button type="submit" size="lg" className="w-full" loading={loading}>
                Create Account
                <ArrowRight size={18} />
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-ink-500">
              Already have an account?{' '}
              <Link to="/signin" className="font-medium text-brand-600 hover:text-brand-700">
                Sign in
              </Link>
            </p>
          </Card>
          )}
        </div>
      </div>
    </div>
  );
}
