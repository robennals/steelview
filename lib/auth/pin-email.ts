// The sign-in email's content, kept apart from the sender so changing email
// provider never changes what readers receive.

export function signInSubject(pin: string): string {
  return `Your Steelview sign-in code: ${pin}`;
}

export function signInText(pin: string): string {
  return `Your sign-in code for Steelview is:\n\n${pin}\n\nThis code expires in 10 minutes. If you didn't request it, you can ignore this email.`;
}

export function signInHtml(pin: string): string {
  return `<!doctype html><html><body style="font-family:system-ui,sans-serif;max-width:480px;margin:0 auto;padding:24px;color:#111">
<h2 style="margin:0 0 16px">Your sign-in code</h2>
<p>Use this code to finish signing in to Steelview:</p>
<p style="font-size:32px;letter-spacing:6px;font-weight:600;background:#f3f4f6;padding:16px;border-radius:8px;text-align:center">${pin}</p>
<p style="color:#6b7280;font-size:14px">This code expires in 10 minutes. If you didn't request it, you can safely ignore this email.</p>
</body></html>`;
}
