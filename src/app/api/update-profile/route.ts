import { NextResponse } from 'next/server';

const PROJECT_ID = 'ritik-coffe-db';
const firestoreBase = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents`;

export async function POST(request: Request) {
  try {
    const { docId, name, photoURL } = await request.json();

    if (!docId) {
      return NextResponse.json({ error: 'docId is required' }, { status: 400 });
    }

    const body: Record<string, any> = { fields: {} };
    const updateMask: string[] = [];

    if (name !== undefined) {
      body.fields.name = { stringValue: name };
      updateMask.push('name');
    }
    if (photoURL !== undefined) {
      body.fields.photoURL = { stringValue: photoURL };
      updateMask.push('photoURL');
    }

    if (updateMask.length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }

    const maskQuery = updateMask.map(f => `updateMask.fieldPaths=${f}`).join('&');
    const url = `${firestoreBase}/users/${encodeURIComponent(docId)}?${maskQuery}`;

    const res = await fetch(url, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    if (data.error) {
      throw new Error(data.error.message || 'Firestore update failed');
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error in /api/update-profile:', error);
    return NextResponse.json({ error: error.message || 'Failed to update profile' }, { status: 500 });
  }
}
