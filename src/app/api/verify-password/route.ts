import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { adminDb, adminAuth } from '@/lib/firebase-admin';

export async function POST(request: Request) {
  try {
    const { phone, password } = await request.json();

    if (!phone || !password) {
      return NextResponse.json({ error: 'Phone and password are required' }, { status: 400 });
    }

    const normalizedPhone = phone.trim().replace(/\s/g, '');

    // Fetch user from Firestore
    const userRef = adminDb.collection('users').doc(normalizedPhone);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return NextResponse.json({ error: 'No account found with this phone number' }, { status: 404 });
    }

    const userData = userDoc.data()!;

    // Verify password
    const passwordMatch = await bcrypt.compare(password, userData.password);
    if (!passwordMatch) {
      return NextResponse.json({ error: 'Incorrect password' }, { status: 401 });
    }

    return NextResponse.json({ success: true, message: 'Password verified. OTP will be sent.' });
  } catch (error: any) {
    console.error('Error in /api/verify-password:', error);
    return NextResponse.json({ error: 'Login failed' }, { status: 500 });
  }
}
