import { NextResponse } from 'next/server';

const PROJECT_ID = 'ritik-coffe-db';
const FIREBASE_API_KEY = 'AIzaSyBa9Ce0S7p3VYR4i0pTJuCQg2_TMXKxn0A';
const firestoreBase = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents`;

async function getFirestoreDoc(collection: string, docId: string) {
  const url = `${firestoreBase}/${collection}/${encodeURIComponent(docId)}`;
  const res = await fetch(url);
  if (!res.ok) return null;
  const data = await res.json();
  if (data.error) return null;
  const fields = data.fields || {};
  const parsed: Record<string, any> = {};
  for (const [key, val] of Object.entries(fields) as any) {
    parsed[key] = val.stringValue ?? val.integerValue ?? val.booleanValue ?? null;
  }
  return parsed;
}

async function deleteFirestoreDoc(collection: string, docId: string) {
  const url = `${firestoreBase}/${collection}/${encodeURIComponent(docId)}`;
  await fetch(url, { method: 'DELETE' });
}

// Sign in to Firebase Auth using Email+Password REST API → returns idToken
async function signInWithEmailPassword(email: string, password: string) {
  const url = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${FIREBASE_API_KEY}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, returnSecureToken: true }),
  });
  return res.json();
}

export async function POST(request: Request) {
  try {
    const { phone, otp, password } = await request.json();
    if (!phone || !otp) {
      return NextResponse.json({ error: 'Phone and OTP are required' }, { status: 400 });
    }

    const normalizedPhone = phone.trim().replace(/\s/g, '').replace('+91', '');

    // 1. Verify OTP from Firestore
    const otpData = await getFirestoreDoc('otps', normalizedPhone);
    if (!otpData) {
      return NextResponse.json({ error: 'OTP not found or already used. Please request a new one.' }, { status: 400 });
    }

    if (new Date(otpData.expiresAt) < new Date()) {
      await deleteFirestoreDoc('otps', normalizedPhone);
      return NextResponse.json({ error: 'OTP has expired. Please request a new one.' }, { status: 400 });
    }

    if (otpData.otp !== otp.trim()) {
      return NextResponse.json({ error: 'Invalid OTP. Please try again.' }, { status: 400 });
    }

    // OTP is valid — delete it (one-time use)
    await deleteFirestoreDoc('otps', normalizedPhone);

    // 2. Fetch user profile from Firestore
    const userData = await getFirestoreDoc('users', normalizedPhone);
    if (!userData) {
      return NextResponse.json({ error: 'User profile not found.' }, { status: 404 });
    }

    // 3. Sign into Firebase Auth using the fake email (to get a real idToken for client)
    //    We use the password stored by user during registration
    //    If password not provided in this call, we use a placeholder (OTP login case)
    const fakeEmail = `${normalizedPhone}@coffeeapp.app`;
    const loginPassword = password || userData.password; // password must be passed from client
    
    let idToken = '';
    if (password) {
      const authResult = await signInWithEmailPassword(fakeEmail, password);
      if (authResult.idToken) {
        idToken = authResult.idToken;
      }
    }

    return NextResponse.json({
      success: true,
      idToken, // client uses this to sign in with Firebase
      userProfile: {
        name: userData.name,
        phone: userData.phone,
        photoURL: userData.photoURL || '',
        memberSince: userData.memberSince,
        brewPoints: Number(userData.brewPoints) || 0,
      },
    });
  } catch (error: any) {
    console.error('Error in /api/verify-otp:', error);
    return NextResponse.json({ error: error.message || 'OTP verification failed' }, { status: 500 });
  }
}
