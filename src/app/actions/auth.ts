'use server';

// In-memory store for OTPs (For demo purposes only, clears on hot reload)
const otpStore = new Map<string, string>();

export async function sendOtp(email: string) {
  // Generate a random 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  otpStore.set(email, otp);
  
  // Log on the server side so it shows in the terminal
  console.log(`\n================================`);
  console.log(`🔐 OTP for ${email}: ${otp}`);
  console.log(`================================\n`);
  
  return { success: true, mockOtp: otp };
}

export async function verifyOtp(email: string, otp: string) {
  const storedOtp = otpStore.get(email);
  if (storedOtp === otp) {
    otpStore.delete(email); // clear OTP after successful use
    return { success: true };
  }
  return { success: false, error: 'Invalid OTP' };
}
