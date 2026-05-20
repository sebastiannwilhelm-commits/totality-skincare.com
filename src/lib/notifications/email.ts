const RESEND_API = "https://api.resend.com/emails";

export type SendEmailParams = {
  to: string;
  subject: string;
  html: string;
  text?: string;
};

/** Sends via Resend when RESEND_API_KEY is set; otherwise no-op (returns false). */
export async function sendEmail(params: SendEmailParams): Promise<boolean> {
  const key = process.env.RESEND_API_KEY?.trim();
  if (!key) return false;

  const from = process.env.RESEND_FROM_EMAIL?.trim() || "Totality Skincare <onboarding@resend.dev>";

  const res = await fetch(RESEND_API, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [params.to],
      subject: params.subject,
      html: params.html,
      text: params.text,
    }),
  });

  if (!res.ok) {
    console.error("resend", await res.text());
    return false;
  }
  return true;
}
