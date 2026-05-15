'use server';

// Use globalThis to persist the Map across Next.js hot reloads in development
const globalStore = globalThis as any;
if (!globalStore.otpStore) {
  globalStore.otpStore = new Map<string, string>();
}
const otpStore = globalStore.otpStore;

export async function sendOtp(email: string) {
  const normalizedEmail = email.trim();
  // Generate a random 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  otpStore.set(normalizedEmail, otp);
  
  // Log on the server side so it shows in the terminal
  console.log(`\n================================`);
  console.log(`🔐 OTP for ${normalizedEmail}: ${otp}`);
  console.log(`================================\n`);
  
  return { success: true, mockOtp: otp };
}

export async function verifyOtp(email: string, otp: string) {
  const normalizedEmail = email.trim();
  const normalizedOtp = otp.trim();
  
  const storedOtp = otpStore.get(normalizedEmail);
  
  // For demo purposes, we check the stored OTP or accept '123456' as a universal fallback
  if (storedOtp === normalizedOtp || normalizedOtp === '123456') {
    otpStore.delete(normalizedEmail); // clear OTP after successful use
    return { success: true };
  }
  
  return { success: false, error: 'Invalid OTP' };
}
