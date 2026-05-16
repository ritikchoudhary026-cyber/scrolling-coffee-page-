import { NextResponse } from 'next/server';
import { adminDb, adminAuth } from '@/lib/firebase-admin';

export async function POST(request: Request) {
  try {
    const { phone, otp } = await request.json();

    if (!phone || !otp) {
      return NextResponse.json({ error: 'Phone and OTP are required' }, { status: 400 });
    }

    const normalizedPhone = phone.trim().replace(/\s/g, '');

    // Fetch OTP record from Firestore
    const otpRef = adminDb.collection('otps').doc(normalizedPhone);
    const otpDoc = await otpRef.get();

    if (!otpDoc.exists) {
      return NextResponse.json({ error: 'OTP not found or already used' }, { status: 400 });
    }

    const otpData = otpDoc.data()!;

    // Check expiry
    if (new Date(otpData.expiresAt) < new Date()) {
      await otpRef.delete();
      return NextResponse.json({ error: 'OTP has expired. Please request a new one.' }, { status: 400 });
    }

    // Check OTP value
    if (otpData.otp !== otp.trim()) {
      return NextResponse.json({ error: 'Invalid OTP' }, { status: 400 });
    }

    // OTP is valid - delete it (one-time use)
    await otpRef.delete();

    // Fetch user profile from Firestore
    const userRef = adminDb.collection('users').doc(normalizedPhone);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return NextResponse.json({ error: 'User account not found' }, { status: 404 });
    }

    const userData = userDoc.data()!;

    // Get or Create a Firebase Auth user for this phone (to generate a custom token)
    let uid: string;
    try {
      // Try to get existing user by phoneNumber
      const existingUser = await adminAuth.getUserByPhoneNumber(`+91${normalizedPhone.replace('+91', '')}`);
      uid = existingUser.uid;
    } catch (err: any) {
      if (err.code === 'auth/user-not-found') {
        // Create user in Firebase Auth
        const newUser = await adminAuth.createUser({
          phoneNumber: `+91${normalizedPhone.replace('+91', '')}`,
          displayName: userData.name,
        });
        uid = newUser.uid;
        // Update Firestore doc with uid
        await userRef.update({ uid });
      } else {
        throw err;
      }
    }

    // Generate custom token for client-side signIn
    const customToken = await adminAuth.createCustomToken(uid);

    return NextResponse.json({ 
      success: true, 
      customToken,
      userProfile: {
        name: userData.name,
        phone: userData.phone,
        photoURL: userData.photoURL,
        memberSince: userData.memberSince,
        brewPoints: userData.brewPoints,
      }
    });

  } catch (error: any) {
    console.error('Error in /api/verify-otp:', error);
    return NextResponse.json({ 
      error: error.message || 'Failed to verify OTP'
    }, { status: 500 });
  }
}
