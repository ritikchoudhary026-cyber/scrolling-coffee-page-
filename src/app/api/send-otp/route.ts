import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

const PROJECT_ID = 'ritik-coffe-db';
const firestoreBase = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents`;

async function saveOtp(docId: string, otp: string) {
  const expiresAt = new Date();
  expiresAt.setMinutes(expiresAt.getMinutes() + 5);
  const url = `${firestoreBase}/otps/${encodeURIComponent(docId)}`;
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

async function sendEmailOtp(email: string, otp: string): Promise<boolean> {
  const emailUser = process.env.EMAIL_USER;
  const emailPass = process.env.EMAIL_PASS;

  if (!emailUser || !emailPass) {
    console.log(`\n📧 [DEV MODE] Email OTP for ${email}: ${otp}\n`);
    return true;
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: emailUser, pass: emailPass },
  });

  await transporter.sendMail({
    from: `"Anti-Gravity Coffee" <${emailUser}>`,
    to: email,
    subject: 'Your Login OTP – Anti-Gravity Coffee',
    html: `
      <div style="font-family:sans-serif;background:#050505;padding:40px;color:#fff;border-radius:12px;max-width:480px;margin:auto;">
        <h2 style="color:#EAC678;margin-bottom:8px;">Your OTP Code</h2>
        <p style="color:#aaa;">Use the code below to verify your identity. It expires in 5 minutes.</p>
        <div style="font-size:36px;font-weight:bold;letter-spacing:12px;color:#EAC678;background:#111;padding:20px;border-radius:8px;text-align:center;margin:24px 0;">${otp}</div>
        <p style="color:#555;font-size:12px;">If you didn't request this, please ignore this email.</p>
      </div>
    `,
  });
  return true;
}

async function sendSmsOtp(phone: string, otp: string): Promise<boolean> {
  const apiKey = process.env.FAST2SMS_API_KEY;
  if (!apiKey) {
    console.log(`\n📱 [DEV MODE] SMS OTP for +91${phone}: ${otp}\n`);
    return true;
  }

  const response = await fetch('https://www.fast2sms.com/dev/bulkV2', {
    method: 'POST',
    headers: { authorization: apiKey, 'Content-Type': 'application/json' },
    body: JSON.stringify({ route: 'otp', variables_values: otp, numbers: phone }),
  });
  const data = await response.json();
  console.log('Fast2SMS response:', data);
  return data.return === true;
}

export async function POST(request: Request) {
  try {
    const { contact } = await request.json();
    if (!contact) return NextResponse.json({ error: 'Contact is required' }, { status: 400 });

    const isEmail = contact.includes('@');
    const normalizedContact = isEmail
      ? contact.trim().toLowerCase()
      : contact.trim().replace(/\s/g, '').replace('+91', '');

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    await saveOtp(normalizedContact, otp);

    let sent = false;
    if (isEmail) {
      sent = await sendEmailOtp(normalizedContact, otp);
    } else {
      sent = await sendSmsOtp(normalizedContact, otp);
    }

    if (!sent) {
      return NextResponse.json({ error: 'Failed to send OTP' }, { status: 500 });
    }

    const isDev = isEmail
      ? !process.env.EMAIL_USER
      : !process.env.FAST2SMS_API_KEY;

    return NextResponse.json({
      success: true,
      isEmail,
      ...(isDev && { devOtp: otp }),
    });
  } catch (error: any) {
    console.error('Error in /api/send-otp:', error);
    return NextResponse.json({ error: 'Failed to send OTP: ' + error.message }, { status: 500 });
  }
}
