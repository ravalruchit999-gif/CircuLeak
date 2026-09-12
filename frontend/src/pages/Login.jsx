import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { ShieldCheck, Lock, Mail, ArrowRight, ArrowLeft } from 'lucide-react';

export function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isExpired = new URLSearchParams(location.search).get('expired') === '1';
  const from = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter both work email and password.');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      const loggedUser = await login(email, password);
      const target = loggedUser?.role === 'admin' && from === '/dashboard' ? '/admin' : from;
      navigate(target, { replace: true });
    } catch (err) {
      setError(err.message || 'Invalid credentials. Please check your email and password.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0e14] text-slate-100 flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-10 right-10 w-80 h-80 bg-blue-600/5 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md space-y-6 relative z-10">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center gap-2 p-2 rounded-xl bg-[#131924] border border-[#232b3b] shadow-lg mb-1">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-slate-950 font-black text-lg tracking-tighter">
              CL
            </div>
            <span className="text-xl font-bold tracking-tight text-white font-sans">
              Circu<span className="text-emerald-400">Leak</span>
            </span>
          </div>

          <p className="text-xs text-slate-400 font-mono uppercase tracking-wider">
            Industrial Carbon Intelligence & Circular Optimization
          </p>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950/80 border border-emerald-800 text-[11px] text-emerald-300 font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Live PostgreSQL Telemetry Pipeline
          </div>
        </div>

        {/* Login Card */}
        <div className="bg-[#12161f] border border-[#212836] rounded-xl p-6 sm:p-8 shadow-2xl space-y-5">
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">
              Sign In to Your Facility
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Enter your enterprise credentials to access real-time emission monitoring and leak diagnostics.
            </p>
          </div>

          {error && (
            <div className="p-3 rounded bg-red-950/50 border border-red-800/80 text-red-300 text-xs flex items-start gap-2">
              <span className="shrink-0 font-bold font-mono">!</span>
              <span>{error}</span>
            </div>
          )}

          {isExpired && !error && (
            <div className="p-3 rounded bg-amber-950/60 border border-amber-800/80 text-amber-300 text-xs flex items-start gap-2">
              <span className="shrink-0 font-bold font-mono text-amber-400">i</span>
              <span>Your session token has expired or was reset. Please sign in below to resume.</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-1.5">
                Work Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="manager@apexmetals.com"
                  className="w-full pl-9 pr-3 py-2 bg-[#171c26] border border-[#283244] rounded text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-9 pr-3 py-2 bg-[#171c26] border border-[#283244] rounded text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono transition-colors"
                />
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="md"
              className="w-full justify-center mt-2 py-2.5"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Authenticating...' : 'Sign In to Workspace'}
              <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          </form>

          {/* Security & Access Notice */}
          <div className="pt-3 border-t border-[#1e2533] space-y-2 text-center text-xs text-slate-400">
            <div className="flex items-center justify-center gap-1.5 text-slate-500 text-[11px] font-mono">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>Bcrypt 12-round salted encryption • RBAC isolated</span>
            </div>
            <p className="text-[11px] text-slate-500">
              Platform administration is strictly restricted to designated audit credentials.
            </p>
          </div>
        </div>

        {/* Links */}
        <div className="space-y-2 text-center text-xs text-slate-400">
          <div>
            Onboarding a new manufacturing facility?{' '}
            <Link to="/register" className="text-emerald-400 hover:text-emerald-300 font-medium underline underline-offset-2">
              Create facility workspace
            </Link>
          </div>
          <div>
            <Link to="/" className="inline-flex items-center gap-1 text-slate-500 hover:text-slate-300 transition-colors text-[11px] font-mono">
              <ArrowLeft className="w-3 h-3" />
              Return to CircuLeak Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
export default Login;
