import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

async function sendSmsViaSmsapi(phone: string, otp: string): Promise<boolean> {
  const apiKey = process.env.FAST2SMS_API_KEY || process.env.SMS_API_KEY;
  
  if (!apiKey) {
    console.log(`[DEV MODE] OTP for ${phone}: ${otp}`);
    return true; // In dev mode, just log it
  }
  
  try {
    // Try Fast2SMS (Indian SMS gateway - most popular)
    const response = await fetch('https://www.fast2sms.com/dev/bulkV2', {
      method: 'POST',
      headers: {
        'authorization': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        route: 'otp',
        variables_values: otp,
        numbers: phone.replace('+91', ''),
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

    const normalizedPhone = phone.trim().replace(/\s/g, '');

    // Generate a 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Store OTP in Firestore with 5 minute expiry
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 5);

    await adminDb.collection('otps').doc(normalizedPhone).set({
      otp,
      expiresAt: expiresAt.toISOString(),
      createdAt: new Date().toISOString(),
    });

    // Send SMS
    const sent = await sendSmsViaSmsapi(normalizedPhone, otp);

    if (!sent) {
      return NextResponse.json({ error: 'Failed to send OTP via SMS' }, { status: 500 });
    }

    const isDev = !process.env.FAST2SMS_API_KEY && !process.env.SMS_API_KEY;
    
    return NextResponse.json({ 
      success: true, 
      message: isDev ? 'OTP logged to server console (dev mode)' : 'OTP sent via SMS',
      // Only include otp in dev mode for easy testing
      ...(isDev && { devOtp: otp }),
    });
  } catch (error: any) {
    console.error('Error in /api/send-otp:', error);
    return NextResponse.json({ error: 'Failed to send OTP' }, { status: 500 });
  }
}
