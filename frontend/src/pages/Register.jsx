import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { Building2, User, Mail, Lock, Factory, ArrowRight } from 'lucide-react';

export function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: '',
    company_name: '',
    sector: 'Alloy & Steel Fabrication',
  });
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.full_name || !formData.email || !formData.password || !formData.company_name) {
      setError('Please complete all required fields.');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      await register({
        ...formData,
        role: 'facility_manager',
      });
      // Direct new user straight to Data Ingestion onboarding
      navigate('/data-upload', { replace: true });
    } catch (err) {
      setError(err.message || 'Registration failed. An account with this email may already exist.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0e14] text-slate-100 flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 relative overflow-hidden py-12">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-lg space-y-6 relative z-10">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center gap-2 p-2 rounded-xl bg-[#131924] border border-[#232b3b] shadow-lg mb-1">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-slate-950 font-black text-base tracking-tighter">
              CL
            </div>
            <span className="text-lg font-bold tracking-tight text-white font-sans">
              Circu<span className="text-emerald-400">Leak</span>
            </span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Register Facility Workspace
          </h2>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Create an enterprise account to ingest plant telemetry, detect carbon leaks, and simulate circular interventions.
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-[#12161f] border border-[#212836] rounded-xl p-6 sm:p-8 shadow-2xl space-y-5">
          {error && (
            <div className="p-3 rounded bg-red-950/50 border border-red-800/80 text-red-300 text-xs flex items-start gap-2">
              <span className="shrink-0 font-bold font-mono">!</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-mono uppercase tracking-wider text-slate-300 mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    name="full_name"
                    value={formData.full_name}
                    onChange={handleChange}
                    placeholder="Rohit Sharma"
                    className="w-full pl-9 pr-3 py-2 bg-[#171c26] border border-[#283244] rounded text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-sans transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block font-mono uppercase tracking-wider text-slate-300 mb-1.5">
                  Work Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="r.sharma@precisioncast.com"
                    className="w-full pl-9 pr-3 py-2 bg-[#171c26] border border-[#283244] rounded text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono transition-colors"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-mono uppercase tracking-wider text-slate-300 mb-1.5">
                  Company / Plant Name
                </label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    name="company_name"
                    value={formData.company_name}
                    onChange={handleChange}
                    placeholder="Precision Casting Works"
                    className="w-full pl-9 pr-3 py-2 bg-[#171c26] border border-[#283244] rounded text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-sans transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block font-mono uppercase tracking-wider text-slate-300 mb-1.5">
                  Manufacturing Sector
                </label>
                <div className="relative">
                  <Factory className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <select
                    name="sector"
                    value={formData.sector}
                    onChange={handleChange}
                    className="w-full pl-9 pr-3 py-2 bg-[#171c26] border border-[#283244] rounded text-sm text-white focus:outline-none focus:border-emerald-500 font-sans transition-colors cursor-pointer"
                  >
                    <option value="Alloy & Steel Fabrication">Alloy & Steel Fabrication</option>
                    <option value="Metals & Heavy Alloys">Metals & Heavy Alloys</option>
                    <option value="Textile & Garment Dyeing">Textile & Garment Dyeing</option>
                    <option value="Cement & Lime Processing">Cement & Lime Processing</option>
                    <option value="Chemical & Petrochemical">Chemical & Petrochemical</option>
                    <option value="Automotive Component Casting">Automotive Component Casting</option>
                  </select>
                </div>
              </div>
            </div>

            <div>
              <label className="block font-mono uppercase tracking-wider text-slate-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Minimum 6 characters"
                  className="w-full pl-9 pr-3 py-2 bg-[#171c26] border border-[#283244] rounded text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono transition-colors"
                />
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="md"
              className="w-full justify-center mt-4 py-2.5"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Creating Workspace...' : 'Create Account & Begin Onboarding'}
              <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          </form>
        </div>

        <div className="text-center text-xs text-slate-400">
          Already have an existing facility workspace?{' '}
          <Link to="/login" className="text-emerald-400 hover:text-emerald-300 font-medium underline underline-offset-2">
            Sign in here
          </Link>
        </div>
      </div>
    </div>
  );
}
export default Register;
