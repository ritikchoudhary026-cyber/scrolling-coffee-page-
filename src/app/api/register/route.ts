import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

const PROJECT_ID = 'ritik-coffe-db';
const FIREBASE_API_KEY = 'AIzaSyBa9Ce0S7p3VYR4i0pTJuCQg2_TMXKxn0A';
const firestoreBase = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents`;

async function setFirestoreDoc(collection: string, docId: string, data: Record<string, any>) {
  const fields: Record<string, any> = {};
  for (const [key, val] of Object.entries(data)) {
    if (val === null || val === undefined) fields[key] = { nullValue: null };
    else if (typeof val === 'string') fields[key] = { stringValue: val };
    else if (typeof val === 'number') fields[key] = { integerValue: String(val) };
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

async function createFirebaseAuthUser(email: string, password: string) {
  const url = `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${FIREBASE_API_KEY}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, returnSecureToken: true }),
  });
  return res.json();
}

async function updateDisplayName(idToken: string, displayName: string) {
  const url = `https://identitytoolkit.googleapis.com/v1/accounts:update?key=${FIREBASE_API_KEY}`;
  await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ idToken, displayName }),
  });
}

export async function POST(request: Request) {
  try {
    const { name, contact, password } = await request.json();

    if (!name || !contact || !password) {
      return NextResponse.json({ error: 'Name, phone/email, and password are required' }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
    }

    const isEmail = contact.includes('@') && !contact.endsWith('@coffeeapp.app');
    // Normalize: for phone strip spaces/+91, for email use as-is
    const normalizedContact = isEmail
      ? contact.trim().toLowerCase()
      : contact.trim().replace(/\s/g, '').replace('+91', '');

    // The docId used in Firestore users collection
    const docId = normalizedContact;

    // Check if user already exists
    const existingUser = await getFirestoreDoc('users', docId);
    if (existingUser) {
      return NextResponse.json({ error: 'An account with this email/phone already exists' }, { status: 409 });
    }

    // Determine the actual Firebase Auth email
    // - If real email → use directly
    // - If phone → create fake email like 9876543210@coffeeapp.app
    const firebaseEmail = isEmail ? normalizedContact : `${normalizedContact}@coffeeapp.app`;

    // Create Firebase Auth user
    const authResult = await createFirebaseAuthUser(firebaseEmail, password);
    if (authResult.error) {
      const msg = authResult.error.message || 'Failed to create account';
      return NextResponse.json({ error: msg }, { status: 400 });
    }

    // Update display name
    if (authResult.idToken) {
      await updateDisplayName(authResult.idToken, name);
    }

    // Hash password for Firestore storage
    const hashedPassword = await bcrypt.hash(password, 12);

    // Save user profile to Firestore
    await setFirestoreDoc('users', docId, {
      name,
      contact: normalizedContact,
      isEmail: isEmail ? 'true' : 'false',
      phone: isEmail ? '' : normalizedContact,
      email: isEmail ? normalizedContact : '',
      password: hashedPassword,
      photoURL: '',
      memberSince: String(new Date().getFullYear()),
      brewPoints: 100,
      uid: authResult.localId || '',
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({ success: true, isEmail });
  } catch (error: any) {
    console.error('Error in /api/register:', error);
    return NextResponse.json({ error: 'Failed to create account: ' + error.message }, { status: 500 });
  }
}
