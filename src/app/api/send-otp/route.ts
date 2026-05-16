import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { adminDb } from '@/lib/firebase-admin';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Generate a 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Store OTP in Firestore with an expiration time (e.g., 5 minutes)
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 5);

    try {
      await adminDb.collection('otps').doc(email).set({
        otp,
        expiresAt,
        createdAt: new Date(),
      });
    } catch (dbError) {
      console.warn('Could not save OTP to Firestore. Make sure FIREBASE_SERVICE_ACCOUNT_KEY is set. Falling back to memory storage is not implemented, OTP might fail in production.', dbError);
    }

    // Try sending email with Nodemailer
    const emailUser = process.env.EMAIL_USER;
    const emailPass = process.env.EMAIL_PASS;

    if (emailUser && emailPass) {
      const transporter = nodemailer.createTransport({
        service: 'gmail', // or your preferred service
        auth: {
          user: emailUser,
          pass: emailPass,
        },
      });

      await transporter.sendMail({
        from: `"Anti-Gravity Portfolio" <${emailUser}>`,
        to: email,
        subject: 'Your Login OTP',
        html: `
          <div style="font-family: sans-serif; padding: 20px;">
            <h2>Secure Login</h2>
            <p>Your One-Time Password (OTP) for login is:</p>
            <h1 style="font-size: 32px; letter-spacing: 5px; color: #EAC678; background: #111; padding: 15px; border-radius: 8px; display: inline-block;">${otp}</h1>
            <p>This code will expire in 5 minutes. Do not share this code with anyone.</p>
          </div>
        `,
      });
      console.log(`[DEV] OTP sent via Email to ${email}`);
    } else {
      console.log(`[DEV] Nodemailer credentials not set. OTP for ${email} is: ${otp}`);
      // Simulating a network delay
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    return NextResponse.json({ success: true, message: 'OTP processed' });
  } catch (error: any) {
    console.error('Error in /api/send-otp:', error);
    return NextResponse.json({ error: 'Failed to send OTP' }, { status: 500 });
  }
}
