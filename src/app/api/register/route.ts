import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { adminDb } from '@/lib/firebase-admin';

export async function POST(request: Request) {
  try {
    const { name, phone, password } = await request.json();

    if (!name || !phone || !password) {
      return NextResponse.json({ error: 'Name, phone, and password are required' }, { status: 400 });
    }

    // Normalize phone number
    const normalizedPhone = phone.trim().replace(/\s/g, '');

    // Check if user already exists
    const userRef = adminDb.collection('users').doc(normalizedPhone);
    const existingUser = await userRef.get();

    if (existingUser.exists) {
      return NextResponse.json({ error: 'An account with this phone number already exists' }, { status: 409 });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Save user to Firestore
    await userRef.set({
      name,
      phone: normalizedPhone,
      password: hashedPassword,
      photoURL: '',
      memberSince: new Date().getFullYear().toString(),
      brewPoints: 100,
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({ success: true, message: 'Account created successfully' });
  } catch (error: any) {
    console.error('Error in /api/register:', error);
    return NextResponse.json({ error: 'Failed to create account' }, { status: 500 });
  }
}
