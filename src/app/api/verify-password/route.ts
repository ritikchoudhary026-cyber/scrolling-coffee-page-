import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

const PROJECT_ID = 'ritik-coffe-db';
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

export async function POST(request: Request) {
  try {
    const { contact, password } = await request.json();
    if (!contact || !password) {
      return NextResponse.json({ error: 'Contact and password are required' }, { status: 400 });
    }

    const isEmail = contact.includes('@');
    const normalizedContact = isEmail
      ? contact.trim().toLowerCase()
      : contact.trim().replace(/\s/g, '').replace('+91', '');

    // Fetch user from Firestore
    const userData = await getFirestoreDoc('users', normalizedContact);
    if (!userData) {
      return NextResponse.json({ error: 'No account found. Please sign up first.' }, { status: 404 });
    }

    // Verify password
    const passwordMatch = await bcrypt.compare(password, userData.password);
    if (!passwordMatch) {
      return NextResponse.json({ error: 'Incorrect password' }, { status: 401 });
    }

    return NextResponse.json({ success: true, isEmail: userData.isEmail === 'true' });
  } catch (error: any) {
    console.error('Error in /api/verify-password:', error);
    return NextResponse.json({ error: 'Login failed: ' + error.message }, { status: 500 });
  }
}
