import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

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

async function getFirestoreDocRaw(collection: string, docId: string) {
  const url = `${firestoreBase}/${collection}/${encodeURIComponent(docId)}`;
  const res = await fetch(url);
  if (!res.ok) return null;
  const data = await res.json();
  if (data.error) return null;
  return data; // return raw to preserve all field types for PATCH
}

async function deleteFirestoreDoc(collection: string, docId: string) {
  const url = `${firestoreBase}/${collection}/${encodeURIComponent(docId)}`;
  await fetch(url, { method: 'DELETE' });
}

// Update specific fields in Firestore doc using field mask
async function updateFirestoreFields(collection: string, docId: string, fields: Record<string, string>) {
  const body: Record<string, any> = { fields: {} };
  const updateMask: string[] = [];

  for (const [key, val] of Object.entries(fields)) {
    body.fields[key] = { stringValue: val };
    updateMask.push(key);
  }

  const maskQuery = updateMask.map(f => `updateMask.fieldPaths=${f}`).join('&');
  const url = `${firestoreBase}/${collection}/${encodeURIComponent(docId)}?${maskQuery}`;
  const res = await fetch(url, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return res.json();
}

// Update Firebase Auth password via REST
async function updateFirebaseAuthPassword(email: string, newPassword: string) {
  // First sign in to get idToken
  const signInUrl = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${FIREBASE_API_KEY}`;
  // We can't sign in here as we don't have the old password
  // So we use the oobCode flow or just update Firestore password hash only
  // Firebase Auth password update requires an idToken - skip Firebase Auth update, 
  // our auth is based on Firestore password hash anyway
  return true;
}

export async function POST(request: Request) {
  try {
    const { contact, otp, newPassword } = await request.json();

    if (!contact || !otp || !newPassword) {
      return NextResponse.json({ error: 'Contact, OTP, and new password are required' }, { status: 400 });
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
    }

    const isEmail = contact.includes('@');
    const normalizedContact = isEmail
      ? contact.trim().toLowerCase()
      : contact.trim().replace(/\s/g, '').replace('+91', '');

    // 1. Verify OTP
    const otpData = await getFirestoreDoc('otps', normalizedContact);
    if (!otpData) {
      return NextResponse.json({ error: 'OTP not found or already used. Request a new one.' }, { status: 400 });
    }
    if (new Date(otpData.expiresAt) < new Date()) {
      await deleteFirestoreDoc('otps', normalizedContact);
      return NextResponse.json({ error: 'OTP has expired. Request a new one.' }, { status: 400 });
    }
    if (otpData.otp !== otp.trim()) {
      return NextResponse.json({ error: 'Invalid OTP. Please try again.' }, { status: 400 });
    }

    // OTP valid — delete it
    await deleteFirestoreDoc('otps', normalizedContact);

    // 2. Check user exists
    const userData = await getFirestoreDoc('users', normalizedContact);
    if (!userData) {
      return NextResponse.json({ error: 'No account found with this contact.' }, { status: 404 });
    }

    // 3. Hash new password and update Firestore
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    await updateFirestoreFields('users', normalizedContact, { password: hashedPassword });

    return NextResponse.json({ success: true, message: 'Password reset successfully' });
  } catch (error: any) {
    console.error('Error in /api/reset-password:', error);
    return NextResponse.json({ error: error.message || 'Password reset failed' }, { status: 500 });
  }
}
