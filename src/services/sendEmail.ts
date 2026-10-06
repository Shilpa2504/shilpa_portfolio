/// <reference types="vite/client" />

export interface ContactPayload {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export async function sendContactEmail(data: ContactPayload): Promise<{ ok: boolean; message: string }> {
  const apiKey = import.meta.env.VITE_BREVO_API_KEY?.trim();
  const senderEmail = import.meta.env.VITE_BREVO_SENDER_EMAIL?.trim() || 'shilpakalwar25@gmail.com';
  const senderName = import.meta.env.VITE_BREVO_SENDER_NAME?.trim() || 'Portfolio Contact Form';

  if (!apiKey || apiKey === 'your_brevo_api_key_here') {
    // If Brevo API key is not configured, fall back to mailto for convenience
    const body = `Hi Shilpa,\n\nName: ${data.name}\nEmail: ${data.email}\nSubject: ${data.subject}\n\nMessage:\n${data.message}`;
    const mailto = `mailto:shilpakalwar25@gmail.com?subject=${encodeURIComponent(data.subject || 'Portfolio Enquiry')}&body=${encodeURIComponent(body)}`;
    
    window.open(mailto, '_blank');
    return {
      ok: true,
      message: 'Opened your message in your email client! Add your Brevo API key in .env to enable direct background delivery.',
    };
  }

  try {
    const res = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'api-key': apiKey,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        sender: {
          name: senderName,
          email: senderEmail,
        },
        to: [{ email: 'shilpakalwar25@gmail.com' }],
        replyTo: {
          email: data.email,
          name: data.name,
        },
        subject: data.subject ? `[Portfolio] ${data.subject}` : `New Portfolio Enquiry from ${data.name}`,
        htmlContent: `
          <div style="font-family: Arial, sans-serif; background-color: #0f172a; color: #f8fafc; padding: 24px; border-radius: 12px; border: 1px solid #334155; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #c084fc; border-bottom: 1px solid #334155; padding-bottom: 12px; margin-top: 0;">New Message from Portfolio</h2>
            <p style="margin: 8px 0;"><strong>Name:</strong> ${data.name}</p>
            <p style="margin: 8px 0;"><strong>Email:</strong> <a href="mailto:${data.email}" style="color: #38bdf8;">${data.email}</a></p>
            <p style="margin: 8px 0;"><strong>Subject:</strong> ${data.subject || 'No Subject'}</p>
            <div style="margin-top: 16px; padding: 16px; background-color: #1e293b; border-radius: 8px; border-left: 4px solid #c084fc;">
              <p style="margin: 0; white-space: pre-wrap; color: #e2e8f0; font-size: 14px; line-height: 1.6;">${data.message}</p>
            </div>
            <p style="font-size: 12px; color: #94a3b8; margin-top: 24px;">Sent via Brevo Email API from Shilpa Portfolio Contact Form.</p>
          </div>
        `,
        textContent: `New Message from ${data.name} (${data.email}):\nSubject: ${data.subject}\n\n${data.message}`,
      }),
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => res.statusText);
      throw new Error(errText || `Server responded with status ${res.status}`);
    }

    return { ok: true, message: 'Your message has been sent successfully!' };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    return { ok: false, message: `Failed to send email: ${errorMessage}` };
  }
}
