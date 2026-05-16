import { NextResponse } from 'next/server';
import { adminDb, adminAuth } from '@/lib/firebase-admin';

export async function POST(request: Request) {
  try {
    const { email, otp, name } = await request.json();

    if (!email || !otp) {
      return NextResponse.json({ error: 'Email and OTP are required' }, { status: 400 });
    }

    try {
      const otpDoc = await adminDb.collection('otps').doc(email).get();
      
      if (!otpDoc.exists) {
        return NextResponse.json({ error: 'OTP not found or expired' }, { status: 400 });
      }

      const data = otpDoc.data();
      if (!data) {
        return NextResponse.json({ error: 'Invalid OTP data' }, { status: 400 });
      }

      const now = new Date();
      if (data.expiresAt.toDate() < now) {
        await adminDb.collection('otps').doc(email).delete();
        return NextResponse.json({ error: 'OTP has expired' }, { status: 400 });
      }

      if (data.otp !== otp) {
        return NextResponse.json({ error: 'Invalid OTP' }, { status: 400 });
      }

      // OTP is valid! Delete it so it can't be used again
      await adminDb.collection('otps').doc(email).delete();

      // Create or update the user in Firebase Auth
      let userRecord;
      try {
        userRecord = await adminAuth.getUserByEmail(email);
        if (name && !userRecord.displayName) {
          await adminAuth.updateUser(userRecord.uid, { displayName: name });
        }
      } catch (error: any) {
        if (error.code === 'auth/user-not-found') {
          userRecord = await adminAuth.createUser({
            email,
            displayName: name || email.split('@')[0],
          });
        } else {
          throw error;
        }
      }

      // Generate a custom token for the client to sign in
      const customToken = await adminAuth.createCustomToken(userRecord.uid);

      return NextResponse.json({ success: true, customToken });
      
    } catch (dbError) {
      console.error('Database or Auth Admin Error:', dbError);
      return NextResponse.json({ 
        error: 'Backend error verifying OTP. Ensure Firebase Service Account is configured.' 
      }, { status: 500 });
    }

  } catch (error: any) {
    console.error('Error in /api/verify-otp:', error);
    return NextResponse.json({ error: 'Failed to verify OTP' }, { status: 500 });
  }
}
