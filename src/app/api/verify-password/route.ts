import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

const PROJECT_ID = 'ritik-coffe-db';
const firestoreBase = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents`;

async function getDoc(collection: string, docId: string) {
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
    const { phone, password } = await request.json();
    if (!phone || !password) {
      return NextResponse.json({ error: 'Phone and password are required' }, { status: 400 });
    }

    const normalizedPhone = phone.trim().replace(/\s/g, '').replace('+91', '');

    // Fetch user from Firestore
    const userData = await getDoc('users', normalizedPhone);
    if (!userData) {
      return NextResponse.json({ error: 'No account found with this phone number. Please sign up first.' }, { status: 404 });
    }

    // Verify password against bcrypt hash
    const passwordMatch = await bcrypt.compare(password, userData.password);
    if (!passwordMatch) {
      return NextResponse.json({ error: 'Incorrect password' }, { status: 401 });
    }

    return NextResponse.json({ success: true, message: 'Password verified' });
  } catch (error: any) {
    console.error('Error in /api/verify-password:', error);
    return NextResponse.json({ error: 'Login failed: ' + error.message }, { status: 500 });
  }
}
