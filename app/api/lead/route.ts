import { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { name, phone, email } = body;

  if (!name || !phone || !email) {
    return Response.json({ error: 'Missing required fields' }, { status: 400 });
  }

  // Log the lead (in production, send email via Resend or similar)
  console.log('[Lead]', { name, phone, email, timestamp: new Date().toISOString() });

  return Response.json({ success: true, message: 'Lead received' });
}
