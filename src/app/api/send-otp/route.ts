import { NextResponse } from 'next/server';

const PROJECT_ID = 'ritik-coffe-db';
const firestoreBase = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents`;

async function setOtp(phone: string, otp: string) {
  const expiresAt = new Date();
  expiresAt.setMinutes(expiresAt.getMinutes() + 5);

  const url = `${firestoreBase}/otps/${encodeURIComponent(phone)}`;
  await fetch(url, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      fields: {
        otp: { stringValue: otp },
        expiresAt: { stringValue: expiresAt.toISOString() },
        createdAt: { stringValue: new Date().toISOString() },
      },
    }),
  });
}

async function sendSmsViaSmsapi(phone: string, otp: string): Promise<boolean> {
  const apiKey = process.env.FAST2SMS_API_KEY;

  if (!apiKey) {
    console.log(`\n🔑 [DEV MODE] OTP for +91${phone} is: ${otp}\n`);
    return true;
  }

  try {
    const response = await fetch('https://www.fast2sms.com/dev/bulkV2', {
      method: 'POST',
      headers: {
        authorization: apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        route: 'otp',
        variables_values: otp,
        numbers: phone,
      }),
    });

    const data = await response.json();
    console.log('Fast2SMS response:', data);
    return data.return === true;
  } catch (err) {
    console.error('SMS send failed:', err);
    return false;
  }
}

export async function POST(request: Request) {
  try {
    const { phone } = await request.json();
    if (!phone) {
      return NextResponse.json({ error: 'Phone number is required' }, { status: 400 });
    }

    const normalizedPhone = phone.trim().replace(/\s/g, '').replace('+91', '');

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Store in Firestore
    await setOtp(normalizedPhone, otp);

    // Send SMS
    const sent = await sendSmsViaSmsapi(normalizedPhone, otp);
    if (!sent) {
      return NextResponse.json({ error: 'Failed to send OTP via SMS' }, { status: 500 });
    }

    const isDev = !process.env.FAST2SMS_API_KEY;

    return NextResponse.json({
      success: true,
      ...(isDev && { devOtp: otp }),
    });
  } catch (error: any) {
    console.error('Error in /api/send-otp:', error);
    return NextResponse.json({ error: 'Failed to send OTP' }, { status: 500 });
  }
}
