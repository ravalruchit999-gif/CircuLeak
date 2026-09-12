import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { ShieldCheck, Lock, Mail, ArrowRight, Activity, Zap, CheckCircle2 } from 'lucide-react';

export function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || 'Invalid credentials. Please check your email and password.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickFill = async (fillEmail, fillPass) => {
    setEmail(fillEmail);
    setPassword(fillPass);
    setIsSubmitting(true);
    setError(null);
    try {
      await login(fillEmail, fillPass);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || 'Login failed.');
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

          {/* Quick-Fill Demonstration Buttons */}
          <div className="pt-3 border-t border-[#1e2533] space-y-2">
            <div className="text-[10px] font-mono uppercase text-slate-400 text-center tracking-wider">
              Quick One-Click Demo Access
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => handleQuickFill('manager@apexmetals.com', 'ManagerPassword123!')}
                className="p-2 rounded bg-[#171e2b] border border-[#253043] hover:border-emerald-500 text-slate-300 text-left transition-all group"
              >
                <span className="block font-semibold text-white group-hover:text-emerald-400 text-xs">
                  Facility Manager
                </span>
                <span className="text-[10px] text-slate-400 font-mono block truncate">
                  Apex Metals Unit 4
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickFill('admin@circuleak.com', 'AdminPassword123!')}
                className="p-2 rounded bg-[#171e2b] border border-[#253043] hover:border-blue-500 text-slate-300 text-left transition-all group"
              >
                <span className="block font-semibold text-white group-hover:text-blue-400 text-xs">
                  Chief Auditor (Admin)
                </span>
                <span className="text-[10px] text-slate-400 font-mono block truncate">
                  Full Governance Access
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Register Link */}
        <div className="text-center text-xs text-slate-400">
          Onboarding a new manufacturing facility?{' '}
          <Link to="/register" className="text-emerald-400 hover:text-emerald-300 font-medium underline underline-offset-2">
            Create facility workspace
          </Link>
        </div>
      </div>
    </div>
  );
}
export default Login;
