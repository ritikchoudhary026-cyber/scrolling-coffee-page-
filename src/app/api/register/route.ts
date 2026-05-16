import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

const PROJECT_ID = 'ritik-coffe-db';
const FIREBASE_API_KEY = 'AIzaSyBa9Ce0S7p3VYR4i0pTJuCQg2_TMXKxn0A';

// Helper: Firestore REST API base URL
const firestoreBase = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents`;

// Helper: Set a Firestore document via REST
async function setDoc(collection: string, docId: string, data: Record<string, any>) {
  const fields: Record<string, any> = {};
  for (const [key, val] of Object.entries(data)) {
    if (typeof val === 'string') fields[key] = { stringValue: val };
    else if (typeof val === 'number') fields[key] = { integerValue: val };
    else if (typeof val === 'boolean') fields[key] = { booleanValue: val };
  }
  const url = `${firestoreBase}/${collection}/${encodeURIComponent(docId)}`;
  const res = await fetch(url, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fields }),
  });
  return res.json();
}

// Helper: Get a Firestore document via REST
async function getDoc(collection: string, docId: string) {
  const url = `${firestoreBase}/${collection}/${encodeURIComponent(docId)}`;
  const res = await fetch(url);
  if (!res.ok) return null;
  const data = await res.json();
  if (data.error) return null;
  // Parse fields
  const fields = data.fields || {};
  const parsed: Record<string, any> = {};
  for (const [key, val] of Object.entries(fields) as any) {
    parsed[key] = val.stringValue ?? val.integerValue ?? val.booleanValue ?? null;
  }
  return parsed;
}

// Helper: Create Firebase Auth user (Email+Password) via REST
async function createFirebaseUser(email: string, password: string) {
  const url = `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${FIREBASE_API_KEY}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, returnSecureToken: true }),
  });
  return res.json();
}

// Helper: Update Firebase Auth display name
async function updateDisplayName(idToken: string, displayName: string) {
  const url = `https://identitytoolkit.googleapis.com/v1/accounts:update?key=${FIREBASE_API_KEY}`;
  await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ idToken, displayName, returnSecureToken: false }),
  });
}

export async function POST(request: Request) {
  try {
    const { name, phone, password } = await request.json();
    if (!name || !phone || !password) {
      return NextResponse.json({ error: 'Name, phone, and password are required' }, { status: 400 });
    }

    const normalizedPhone = phone.trim().replace(/\s/g, '').replace('+91', '');
    const fakeEmail = `${normalizedPhone}@coffeeapp.app`;

    // Check if user already exists in Firestore
    const existingUser = await getDoc('users', normalizedPhone);
    if (existingUser) {
      return NextResponse.json({ error: 'An account with this phone number already exists' }, { status: 409 });
    }

    // Hash the password for Firestore (extra layer)
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create Firebase Auth user
    const authResult = await createFirebaseUser(fakeEmail, password);
    if (authResult.error) {
      return NextResponse.json({ error: authResult.error.message || 'Failed to create account' }, { status: 400 });
    }

    // Update display name
    if (authResult.idToken) {
      await updateDisplayName(authResult.idToken, name);
    }

    // Save user profile to Firestore
    await setDoc('users', normalizedPhone, {
      name,
      phone: normalizedPhone,
      password: hashedPassword,
      photoURL: '',
      memberSince: new Date().getFullYear().toString(),
      brewPoints: '100',
      uid: authResult.localId || '',
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({ success: true, message: 'Account created successfully' });
  } catch (error: any) {
    console.error('Error in /api/register:', error);
    return NextResponse.json({ error: 'Failed to create account' }, { status: 500 });
  }
}
