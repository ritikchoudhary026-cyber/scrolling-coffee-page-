'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { sendOtp, verifyOtp } from '@/app/actions/auth';

export default function InfoSection() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'login' | 'otp' | 'logged_in'>('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setError('');
    try {
      await sendOtp(email);
      setStep('otp');
    } catch (err) {
      setError('Failed to send OTP. Try again.');
    }
    setLoading(false);
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp) return;
    setLoading(true);
    setError('');
    try {
      const res = await verifyOtp(email, otp);
      if (res.success) {
        setStep('logged_in');
      } else {
        setError(res.error || 'Invalid OTP');
      }
    } catch (err) {
      setError('Failed to verify OTP');
    }
    setLoading(false);
  };
  return (
    <section className="py-24 px-8 md:px-24 bg-[#050505] relative z-20 border-t border-white/5">
      <div className="max-w-7xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold tracking-tighter text-white mb-4">
            Dashboard <span className="text-[#EAC678] font-light italic">& Info</span>
          </h2>
          <p className="text-white/50 max-w-xl text-lg font-light">
            Manage your profile, track your orders, and learn more about our commitment to quality.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Profile Card */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="md:col-span-4 bg-white/[0.02] border border-white/10 rounded-3xl p-8 backdrop-blur-md hover:bg-white/[0.04] transition-colors"
          >
            <h3 className="text-[#EAC678] text-sm uppercase tracking-widest mb-6">Profile</h3>
            <div className="flex items-center space-x-6 mb-8">
              <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-[#EAC678] to-[#9A7D46] p-[2px]">
                <div className="w-full h-full rounded-full bg-[#050505] flex items-center justify-center overflow-hidden relative">
                   <div className="absolute inset-0 bg-white/10"></div>
                   <span className="text-2xl font-bold text-[#EAC678]">RC</span>
                </div>
              </div>
              <div>
                <h4 className="text-xl font-medium text-white">Ritik Choudhary</h4>
                <p className="text-white/40 text-sm">Premium Member</p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-4 border-b border-white/5">
                <span className="text-white/60 text-sm">Brew Points</span>
                <span className="text-white font-medium">1,240</span>
              </div>
              <div className="flex justify-between items-center pb-4 border-b border-white/5">
                <span className="text-white/60 text-sm">Member Since</span>
                <span className="text-white font-medium">2024</span>
              </div>
            </div>
            <button className="w-full mt-6 py-3 border border-white/10 rounded-xl text-sm font-medium hover:bg-white/5 transition-colors text-white">
              Edit Profile
            </button>
          </motion.div>

          {/* About Us Card */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="md:col-span-8 bg-gradient-to-br from-white/[0.03] to-transparent border border-white/10 rounded-3xl p-8 md:p-12 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#EAC678]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
            <h3 className="text-[#EAC678] text-sm uppercase tracking-widest mb-6">About Us</h3>
            <h4 className="text-3xl md:text-4xl font-light text-white mb-6 leading-tight">
              Crafting <span className="font-semibold">digital experiences</span> that defy gravity.
            </h4>
            <p className="text-white/60 leading-relaxed text-lg mb-8 max-w-2xl font-light">
              We blend high-end design with robust engineering. Our passion for perfection is like a meticulously brewed espresso—complex, bold, and entirely transformative. Whether it's crafting immersive web applications or engineering complex hardware solutions, we push the boundaries of what's possible.
            </p>
            <div className="grid grid-cols-3 gap-6 pt-8 border-t border-white/10">
              <div>
                <span className="block text-3xl font-bold text-white mb-1">50+</span>
                <span className="text-xs text-white/40 uppercase tracking-wider">Projects</span>
              </div>
              <div>
                <span className="block text-3xl font-bold text-white mb-1">100%</span>
                <span className="text-xs text-white/40 uppercase tracking-wider">Precision</span>
              </div>
              <div>
                <span className="block text-3xl font-bold text-white mb-1">24/7</span>
                <span className="text-xs text-white/40 uppercase tracking-wider">Innovation</span>
              </div>
            </div>
          </motion.div>

          {/* Order History */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="md:col-span-7 bg-white/[0.02] border border-white/10 rounded-3xl p-8 backdrop-blur-md"
          >
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-[#EAC678] text-sm uppercase tracking-widest">Order History</h3>
              <button className="text-white/40 text-sm hover:text-white transition-colors">View All</button>
            </div>
            
            <div className="space-y-4">
              {[
                { id: 'ORD-8923', item: 'Ethiopian Yirgacheffe Pour Over', date: 'May 12, 2026', status: 'Delivered', price: '$8.50' },
                { id: 'ORD-8841', item: 'Double Espresso Black', date: 'May 10, 2026', status: 'Delivered', price: '$4.20' },
                { id: 'ORD-8719', item: 'Anti-Gravity Blend Beans (1lb)', date: 'May 05, 2026', status: 'Processing', price: '$24.00' },
              ].map((order, i) => (
                <div key={i} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 rounded-2xl bg-white/[0.01] hover:bg-white/[0.03] transition-colors border border-transparent hover:border-white/5 cursor-pointer group">
                  <div className="mb-3 sm:mb-0">
                    <div className="flex items-center space-x-3 mb-1">
                      <span className="text-white font-medium">{order.item}</span>
                      <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full ${order.status === 'Delivered' ? 'bg-green-500/10 text-green-400' : 'bg-[#EAC678]/10 text-[#EAC678]'}`}>
                        {order.status}
                      </span>
                    </div>
                    <div className="text-white/40 text-xs">
                      {order.id} • {order.date}
                    </div>
                  </div>
                  <div className="flex items-center space-x-4 w-full sm:w-auto justify-between sm:justify-end">
                    <span className="text-white/80 font-mono">{order.price}</span>
                    <button className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white/50 group-hover:bg-white/10 group-hover:text-white transition-all">
                      →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Login Section */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="md:col-span-5 bg-gradient-to-br from-[#111] to-[#0a0a0a] border border-white/10 rounded-3xl p-8 relative overflow-hidden flex flex-col justify-center"
          >
            <div className="absolute top-0 right-0 w-full h-1 bg-gradient-to-r from-transparent via-[#EAC678]/50 to-transparent"></div>
            
            <h3 className="text-[#EAC678] text-sm uppercase tracking-widest mb-2">Secure Access</h3>
            <h4 className="text-2xl font-medium text-white mb-6">
              {step === 'login' && 'Login to your account'}
              {step === 'otp' && 'Enter OTP verification'}
              {step === 'logged_in' && 'Welcome back!'}
            </h4>
            
            {error && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
                {error}
              </div>
            )}

            {step === 'login' && (
              <form className="space-y-4" onSubmit={handleSendOtp}>
                <div>
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email Address" 
                    required
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-5 py-4 text-white placeholder:text-white/30 focus:outline-none focus:border-[#EAC678]/50 focus:ring-1 focus:ring-[#EAC678]/50 transition-all font-light"
                  />
                </div>
                <div>
                  <input 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password" 
                    required
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-5 py-4 text-white placeholder:text-white/30 focus:outline-none focus:border-[#EAC678]/50 focus:ring-1 focus:ring-[#EAC678]/50 transition-all font-light"
                  />
                </div>
                
                <div className="flex justify-between items-center py-2">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input type="checkbox" className="rounded border-white/20 bg-black/50 text-[#EAC678] focus:ring-[#EAC678]/50 w-4 h-4" />
                    <span className="text-white/50 text-sm">Remember me</span>
                  </label>
                  <a href="#" className="text-[#EAC678] text-sm hover:underline">Forgot?</a>
                </div>
                
                <button 
                  disabled={loading}
                  className="w-full py-4 bg-white text-black hover:bg-gray-200 transition-colors rounded-xl font-medium uppercase tracking-widest text-sm mt-2 disabled:opacity-50"
                >
                  {loading ? 'Sending OTP...' : 'Sign In'}
                </button>
              </form>
            )}

            {step === 'otp' && (
              <form className="space-y-4" onSubmit={handleVerifyOtp}>
                <p className="text-white/50 text-sm mb-4">
                  We sent a 6-digit verification code to <span className="text-white">{email}</span>. Please check your terminal console.
                </p>
                <div>
                  <input 
                    type="text" 
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="Enter 6-digit OTP" 
                    required
                    maxLength={6}
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-5 py-4 text-white placeholder:text-white/30 focus:outline-none focus:border-[#EAC678]/50 focus:ring-1 focus:ring-[#EAC678]/50 transition-all font-light text-center tracking-[0.5em] text-xl"
                  />
                </div>
                <button 
                  disabled={loading}
                  className="w-full py-4 bg-[#EAC678] text-black hover:bg-white transition-colors rounded-xl font-medium uppercase tracking-widest text-sm mt-2 disabled:opacity-50"
                >
                  {loading ? 'Verifying...' : 'Verify & Continue'}
                </button>
                <button 
                  type="button"
                  onClick={() => setStep('login')}
                  className="w-full py-2 text-white/40 hover:text-white text-sm transition-colors mt-2"
                >
                  Back to login
                </button>
              </form>
            )}

            {step === 'logged_in' && (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mb-6">
                  <span className="text-green-400 text-2xl">✓</span>
                </div>
                <h5 className="text-xl font-medium text-white mb-2">Authentication Successful</h5>
                <p className="text-white/50 text-sm mb-8">You have successfully logged in to your account.</p>
                <button 
                  onClick={() => {
                    setStep('login');
                    setEmail('');
                    setPassword('');
                    setOtp('');
                  }}
                  className="px-6 py-2 border border-white/10 rounded-xl text-white/60 hover:text-white hover:bg-white/5 transition-colors text-sm"
                >
                  Sign Out
                </button>
              </div>
            )}
            
            {step === 'login' && (
              <p className="text-center text-white/40 text-sm mt-6">
                New here? <a href="#" className="text-white hover:text-[#EAC678] transition-colors">Create an account</a>
              </p>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
