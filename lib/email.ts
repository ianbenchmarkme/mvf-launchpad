import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const STATUS_LABELS: Record<'completed' | 'wont_do', string> = {
  completed: 'Completed',
  wont_do: "Won't Do",
};

export async function sendResolutionEmail(opts: {
  to: string;
  name: string | null;
  requestSubject: string;
  status: 'completed' | 'wont_do';
  resolutionNote: string;
  resolvedBy: string;
}): Promise<void> {
  if (!process.env.RESEND_API_KEY) {
    console.warn('[email] RESEND_API_KEY not set — skipping resolution email');
    return;
  }

  const { to, name, requestSubject, status, resolutionNote, resolvedBy } = opts;
  const greeting = name ? `Hi ${name},` : 'Hi there,';
  const statusLabel = STATUS_LABELS[status];
  const fromEmail = process.env.RESEND_FROM_EMAIL ?? 'noreply@mvf-launchpad.vercel.app';

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Inter', sans-serif; background: #f8f8fb; margin: 0; padding: 0; }
    .container { max-width: 560px; margin: 40px auto; background: #ffffff; border-radius: 8px; border: 1px solid #e2e2e8; overflow: hidden; }
    .header { background: #0F0F4B; padding: 24px 32px; }
    .header-title { color: #ffffff; font-size: 16px; font-weight: 600; margin: 0; }
    .header-sub { color: rgba(255,255,255,0.5); font-size: 12px; margin: 4px 0 0; }
    .body { padding: 32px; }
    .greeting { color: #1a1a2e; font-size: 15px; margin: 0 0 16px; }
    .subject-block { background: #f8f8fb; border-left: 3px solid #FF00A5; border-radius: 4px; padding: 12px 16px; margin: 0 0 20px; }
    .subject-label { font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: #64788C; margin: 0 0 4px; }
    .subject-text { font-size: 14px; color: #1a1a2e; margin: 0; font-weight: 500; }
    .status-chip { display: inline-block; padding: 3px 10px; border-radius: 999px; font-size: 12px; font-weight: 600; margin: 0 0 20px; }
    .status-completed { background: #dcfce7; color: #16a34a; }
    .status-wont_do { background: #fff0eb; color: #FF5A41; }
    .note-block { background: #f8f8fb; border-radius: 6px; border: 1px solid #e2e2e8; padding: 16px; margin: 0 0 24px; }
    .note-label { font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: #64788C; margin: 0 0 8px; }
    .note-text { font-size: 14px; color: #1a1a2e; margin: 0; line-height: 1.6; }
    .footer { border-top: 1px solid #e2e2e8; padding: 20px 32px; }
    .footer-text { font-size: 12px; color: #64788C; margin: 0; }
    .resolved-by { font-size: 12px; color: #9ca3af; margin: 8px 0 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <p class="header-title">MVF Launchpad</p>
      <p class="header-sub">Support & Feedback</p>
    </div>
    <div class="body">
      <p class="greeting">${greeting}</p>
      <p style="color:#1a1a2e;font-size:14px;margin:0 0 20px;line-height:1.6;">
        We've updated the status of your support request.
      </p>

      <div class="subject-block">
        <p class="subject-label">Your request</p>
        <p class="subject-text">${escapeHtml(requestSubject)}</p>
      </div>

      <span class="status-chip status-${status}">${statusLabel}</span>

      <div class="note-block">
        <p class="note-label">Resolution note</p>
        <p class="note-text">${escapeHtml(resolutionNote)}</p>
      </div>

      <p style="color:#64788C;font-size:13px;margin:0;">
        If you have any further questions, you can submit a new request via MVF Launchpad.
      </p>
    </div>
    <div class="footer">
      <p class="footer-text">The MVF Launchpad Support Team</p>
      <p class="resolved-by">Resolved by ${escapeHtml(resolvedBy)}</p>
    </div>
  </div>
</body>
</html>
  `.trim();

  try {
    await resend.emails.send({
      from: fromEmail,
      to,
      subject: `[Launchpad] Your request has been ${statusLabel.toLowerCase()}: ${requestSubject}`,
      html,
    });
  } catch (err) {
    console.error('[email] Failed to send resolution email:', err);
    // Do not rethrow — email failure should not break the PATCH response
  }
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
