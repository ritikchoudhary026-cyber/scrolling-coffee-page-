'use client';

import { motion } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import { auth, db, storage } from '@/lib/firebase';
import {
  onAuthStateChanged,
  User,
  signInWithCustomToken,
  updateProfile,
  signOut
} from 'firebase/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

interface UserProfile {
  name: string;
  phone: string;
  photoURL: string;
  memberSince: string;
  brewPoints: number;
}

// Steps: login → password_check → otp | signup → signup_otp → logged_in
type Step = 'login' | 'password_check' | 'otp' | 'signup' | 'signup_otp' | 'logged_in';

export default function InfoSection() {
  // Form fields
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<Step>('login');

  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [devOtp, setDevOtp] = useState(''); // shown in dev mode when no SMS API key is set

  // Auth state
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);

  // Profile editing
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editFile, setEditFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Listen to Firebase Auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        setStep('logged_in');
        // Fetch profile from Firestore using phone (stored in displayName as identifier)
        const phoneKey = currentUser.phoneNumber?.replace('+91', '') || '';
        if (phoneKey) {
          try {
            const userDocRef = doc(db, 'users', phoneKey);
            const userDoc = await getDoc(userDocRef);
            if (userDoc.exists()) {
              setProfile(userDoc.data() as UserProfile);
            }
          } catch (e) {
            console.error('Error fetching profile', e);
          }
        }
      } else {
        setProfile(null);
      }
    });
    return () => unsubscribe();
  }, []);

  const normalizePhone = (p: string) => p.trim().replace(/\s/g, '').replace('+91', '');

  // ─── SIGNUP FLOW ─────────────────────────────────────────────────────────────

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone || !password) return;
    setLoading(true);
    setError('');
    try {
      // 1. Register user (saves to Firestore with hashed password)
      const regRes = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone: normalizePhone(phone), password }),
      });
      const regData = await regRes.json();
      if (!regRes.ok) throw new Error(regData.error);

      // 2. Send OTP to phone
      const otpRes = await fetch('/api/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: normalizePhone(phone) }),
      });
      const otpData = await otpRes.json();
      if (!otpRes.ok) throw new Error(otpData.error);

      if (otpData.devOtp) {
        setDevOtp(`[DEV] Your OTP: ${otpData.devOtp}`);
      }

      setStep('signup_otp');
    } catch (err: any) {
      setError(err.message || 'Signup failed');
    }
    setLoading(false);
  };

  // ─── LOGIN FLOW ──────────────────────────────────────────────────────────────

  const handlePasswordCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || !password) return;
    setLoading(true);
    setError('');
    try {
      // 1. Verify password
      const res = await fetch('/api/verify-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: normalizePhone(phone), password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      // 2. Send OTP
      const otpRes = await fetch('/api/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: normalizePhone(phone) }),
      });
      const otpData = await otpRes.json();
      if (!otpRes.ok) throw new Error(otpData.error);

      if (otpData.devOtp) {
        setDevOtp(`[DEV] Your OTP: ${otpData.devOtp}`);
      }

      setStep('otp');
    } catch (err: any) {
      setError(err.message || 'Login failed');
    }
    setLoading(false);
  };

  // ─── OTP VERIFICATION (used for both login & signup) ─────────────────────────

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: normalizePhone(phone), otp }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      // Sign in with custom Firebase token
      await signInWithCustomToken(auth, data.customToken);

      if (data.userProfile) {
        setProfile(data.userProfile);
      }
      setDevOtp('');
      setStep('logged_in');
    } catch (err: any) {
      setError(err.message || 'OTP verification failed');
    }
    setLoading(false);
  };

  // ─── SIGN OUT ─────────────────────────────────────────────────────────────────

  const handleSignOut = async () => {
    await signOut(auth);
    setStep('login');
    setName('');
    setPhone('');
    setPassword('');
    setOtp('');
    setProfile(null);
    setDevOtp('');
    setError('');
  };

  // ─── PROFILE EDITING ──────────────────────────────────────────────────────────

  const startEditing = () => {
    setEditName(profile?.name || '');
    setEditFile(null);
    setIsEditing(true);
  };

  const handleSaveProfile = async () => {
    if (!user || !profile) return;
    setLoading(true);
    try {
      let newPhotoURL = profile.photoURL || '';

      if (editFile) {
        const fileRef = ref(storage, `avatars/${normalizePhone(profile.phone || phone)}`);
        await uploadBytes(fileRef, editFile);
        newPhotoURL = await getDownloadURL(fileRef);
      }

      const phoneKey = normalizePhone(profile.phone || phone);
      const userDocRef = doc(db, 'users', phoneKey);
      await updateDoc(userDocRef, {
        name: editName,
        photoURL: newPhotoURL,
      });

      await updateProfile(user, { displayName: editName, photoURL: newPhotoURL });

      setProfile(prev => prev ? { ...prev, name: editName, photoURL: newPhotoURL } : null);
      setIsEditing(false);
      setEditFile(null);
    } catch (err: any) {
      console.error('Error updating profile:', err);
      alert('Failed to update profile: ' + err.message);
    }
    setLoading(false);
  };

  const getInitials = (n: string) =>
    n.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase();

  const inputClass =
    'w-full bg-black/50 border border-white/10 rounded-xl px-5 py-4 text-white placeholder:text-white/30 focus:outline-none focus:border-[#EAC678]/50 focus:ring-1 focus:ring-[#EAC678]/50 transition-all font-light';
  const btnPrimary =
    'w-full py-4 bg-white text-black hover:bg-[#EAC678] transition-colors rounded-xl font-medium uppercase tracking-widest text-sm mt-2 disabled:opacity-50 disabled:cursor-not-allowed';
  const btnGold =
    'w-full py-4 bg-[#EAC678] text-black hover:bg-white transition-colors rounded-xl font-medium uppercase tracking-widest text-sm mt-2 disabled:opacity-50';

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
            Dashboard <span className="text-[#EAC678] font-light italic">&amp; Info</span>
          </h2>
          <p className="text-white/50 max-w-xl text-lg font-light">
            Manage your profile, track your orders, and learn more about our commitment to quality.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">

          {/* ── PROFILE CARD ── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="md:col-span-4 bg-white/[0.02] border border-white/10 rounded-3xl p-8 backdrop-blur-md hover:bg-white/[0.04] transition-colors"
          >
            <h3 className="text-[#EAC678] text-sm uppercase tracking-widest mb-6">Profile</h3>

            {user && profile ? (
              isEditing ? (
                <div className="space-y-4">
                  <div className="flex flex-col items-center space-y-4 mb-4">
                    <div
                      className="w-24 h-24 rounded-full bg-gradient-to-tr from-[#EAC678] to-[#9A7D46] p-[2px] cursor-pointer group"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <div className="w-full h-full rounded-full bg-[#050505] flex items-center justify-center overflow-hidden relative">
                        {editFile ? (
                          <img src={URL.createObjectURL(editFile)} alt="preview" className="w-full h-full object-cover" />
                        ) : profile.photoURL ? (
                          <img src={profile.photoURL} alt="profile" className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-2xl font-bold text-[#EAC678]">{getInitials(editName || 'A')}</span>
                        )}
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-full">
                          <span className="text-white text-xs">📷 Upload</span>
                        </div>
                      </div>
                    </div>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={(e) => setEditFile(e.target.files?.[0] || null)}
                      accept="image/*"
                      className="hidden"
                    />
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      placeholder="Your Name"
                      className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2 text-white text-center focus:outline-none focus:border-[#EAC678]/50"
                    />
                  </div>
                  <div className="flex space-x-2">
                    <button onClick={() => setIsEditing(false)} className="w-1/2 py-2 border border-white/10 rounded-xl text-sm hover:bg-white/5 text-white">Cancel</button>
                    <button onClick={handleSaveProfile} disabled={loading} className="w-1/2 py-2 bg-[#EAC678] text-black rounded-xl text-sm font-medium hover:bg-white transition-colors disabled:opacity-50">
                      {loading ? 'Saving…' : 'Save'}
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center space-x-5 mb-8">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-[#EAC678] to-[#9A7D46] p-[2px] flex-shrink-0">
                      <div className="w-full h-full rounded-full bg-[#050505] flex items-center justify-center overflow-hidden relative">
                        {profile.photoURL ? (
                          <img src={profile.photoURL} alt="profile" className="w-full h-full object-cover" />
                        ) : (
                          <>
                            <div className="absolute inset-0 bg-white/10" />
                            <span className="text-2xl font-bold text-[#EAC678]">{getInitials(profile.name || 'A')}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xl font-medium text-white truncate">{profile.name}</h4>
                      <p className="text-white/40 text-xs mt-1">{profile.phone ? `+91 ${profile.phone}` : ''}</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center pb-4 border-b border-white/5">
                      <span className="text-white/60 text-sm">Brew Points</span>
                      <span className="text-white font-medium">{profile.brewPoints}</span>
                    </div>
                    <div className="flex justify-between items-center pb-4 border-b border-white/5">
                      <span className="text-white/60 text-sm">Member Since</span>
                      <span className="text-white font-medium">{profile.memberSince}</span>
                    </div>
                  </div>
                  <button
                    onClick={startEditing}
                    className="w-full mt-6 py-3 border border-white/10 rounded-xl text-sm font-medium hover:bg-white/5 transition-colors text-white"
                  >
                    Edit Profile
                  </button>
                </>
              )
            ) : (
              <div className="flex flex-col items-center justify-center h-48 text-white/30 text-sm">
                <span className="text-3xl mb-3">👤</span>
                <p>Log in to view your profile</p>
              </div>
            )}
          </motion.div>

          {/* ── ABOUT US ── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="md:col-span-8 bg-gradient-to-br from-white/[0.03] to-transparent border border-white/10 rounded-3xl p-8 md:p-12 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#EAC678]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <h3 className="text-[#EAC678] text-sm uppercase tracking-widest mb-6">About Us</h3>
            <h4 className="text-3xl md:text-4xl font-light text-white mb-6 leading-tight">
              Crafting <span className="font-semibold">digital experiences</span> that defy gravity.
            </h4>
            <p className="text-white/60 leading-relaxed text-lg mb-8 max-w-2xl font-light">
              We blend high-end design with robust engineering. Our passion for perfection is like a meticulously
              brewed espresso—complex, bold, and entirely transformative.
            </p>
            <div className="grid grid-cols-3 gap-6 pt-8 border-t border-white/10">
              {[['50+', 'Projects'], ['100%', 'Precision'], ['24/7', 'Innovation']].map(([val, label]) => (
                <div key={label}>
                  <span className="block text-3xl font-bold text-white mb-1">{val}</span>
                  <span className="text-xs text-white/40 uppercase tracking-wider">{label}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* ── ORDER HISTORY ── */}
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

            {user ? (
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
                      <div className="text-white/40 text-xs">{order.id} • {order.date}</div>
                    </div>
                    <div className="flex items-center space-x-4 w-full sm:w-auto justify-between sm:justify-end">
                      <span className="text-white/80 font-mono">{order.price}</span>
                      <button className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white/50 group-hover:bg-white/10 group-hover:text-white transition-all">→</button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center h-48 text-white/30 text-sm">
                Log in to view your recent orders.
              </div>
            )}
          </motion.div>

          {/* ── AUTH CARD ── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="md:col-span-5 bg-gradient-to-br from-[#111] to-[#0a0a0a] border border-white/10 rounded-3xl p-8 relative overflow-hidden flex flex-col justify-center"
          >
            <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#EAC678]/50 to-transparent" />

            <h3 className="text-[#EAC678] text-sm uppercase tracking-widest mb-2">Secure Access</h3>
            <h4 className="text-2xl font-medium text-white mb-6">
              {step === 'login' && 'Sign in to your account'}
              {step === 'password_check' && 'Enter your password'}
              {step === 'otp' && 'Verify your identity'}
              {step === 'signup' && 'Create your account'}
              {step === 'signup_otp' && 'Verify your number'}
              {step === 'logged_in' && 'Welcome back!'}
            </h4>

            {error && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
                {error}
              </div>
            )}

            {devOtp && (
              <div className="mb-4 p-3 bg-[#EAC678]/10 border border-[#EAC678]/30 rounded-xl text-[#EAC678] text-sm font-mono">
                {devOtp}
              </div>
            )}

            {/* ── SIGNUP FORM ── */}
            {step === 'signup' && (
              <form className="space-y-4" onSubmit={handleSignup}>
                <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Full Name" required className={inputClass} />
                <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="Phone Number (e.g. 9876543210)" required className={inputClass} />
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Create Password" required minLength={6} className={inputClass} />
                <button disabled={loading} className={btnPrimary}>{loading ? 'Creating Account…' : 'Sign Up & Send OTP'}</button>
                <p className="text-center text-white/40 text-sm mt-4">
                  Already have an account?{' '}
                  <button type="button" onClick={() => { setStep('login'); setError(''); setDevOtp(''); }} className="text-white hover:text-[#EAC678] transition-colors">Sign in</button>
                </p>
              </form>
            )}

            {/* ── LOGIN STEP 1: Phone + Password ── */}
            {step === 'login' && (
              <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); setStep('password_check'); }}>
                <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="Phone Number (e.g. 9876543210)" required className={inputClass} />
                <button
                  type="submit"
                  disabled={loading || !phone}
                  className={btnPrimary}
                >
                  Continue →
                </button>
                <p className="text-center text-white/40 text-sm mt-4">
                  New here?{' '}
                  <button type="button" onClick={() => { setStep('signup'); setError(''); setDevOtp(''); }} className="text-white hover:text-[#EAC678] transition-colors">Create an account</button>
                </p>
              </form>
            )}

            {/* ── LOGIN STEP 2: Password ── */}
            {step === 'password_check' && (
              <form className="space-y-4" onSubmit={handlePasswordCheck}>
                <div className="text-white/50 text-sm mb-2">
                  Signing in as <span className="text-white">+91 {normalizePhone(phone)}</span>
                </div>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" required className={inputClass} />
                <button disabled={loading} className={btnPrimary}>{loading ? 'Sending OTP…' : 'Send OTP'}</button>
                <button type="button" onClick={() => { setStep('login'); setError(''); }} className="w-full py-2 text-white/40 hover:text-white text-sm transition-colors">← Change number</button>
              </form>
            )}

            {/* ── OTP FORM (login) ── */}
            {step === 'otp' && (
              <form className="space-y-4" onSubmit={handleVerifyOtp}>
                <p className="text-white/50 text-sm">
                  We sent a 6-digit OTP to <span className="text-white">+91 {normalizePhone(phone)}</span>. Enter it below.
                </p>
                <input
                  type="text" inputMode="numeric" value={otp}
                  onChange={e => setOtp(e.target.value)}
                  placeholder="● ● ● ● ● ●" required maxLength={6}
                  className={`${inputClass} text-center tracking-[0.6em] text-xl`}
                />
                <button disabled={loading} className={btnGold}>{loading ? 'Verifying…' : 'Verify & Log In'}</button>
                <button type="button" onClick={() => { setStep('password_check'); setOtp(''); setError(''); setDevOtp(''); }} className="w-full py-2 text-white/40 hover:text-white text-sm transition-colors">← Back</button>
              </form>
            )}

            {/* ── OTP FORM (signup) ── */}
            {step === 'signup_otp' && (
              <form className="space-y-4" onSubmit={handleVerifyOtp}>
                <p className="text-white/50 text-sm">
                  OTP sent to <span className="text-white">+91 {normalizePhone(phone)}</span>. Enter it to activate your account.
                </p>
                <input
                  type="text" inputMode="numeric" value={otp}
                  onChange={e => setOtp(e.target.value)}
                  placeholder="● ● ● ● ● ●" required maxLength={6}
                  className={`${inputClass} text-center tracking-[0.6em] text-xl`}
                />
                <button disabled={loading} className={btnGold}>{loading ? 'Verifying…' : 'Verify & Create Account'}</button>
              </form>
            )}

            {/* ── LOGGED IN STATE ── */}
            {step === 'logged_in' && user && (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="w-16 h-16 rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center mb-6">
                  <span className="text-green-400 text-2xl">✓</span>
                </div>
                <h5 className="text-xl font-medium text-white mb-1">Welcome, {profile?.name || 'User'}!</h5>
                <p className="text-white/40 text-sm mb-8">+91 {normalizePhone(profile?.phone || phone)}</p>
                <button onClick={handleSignOut} className="px-6 py-2 border border-white/10 rounded-xl text-white/60 hover:text-white hover:bg-white/5 transition-colors text-sm">
                  Sign Out
                </button>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
