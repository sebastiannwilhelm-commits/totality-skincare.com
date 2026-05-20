export type SendSmsParams = {
  to: string;
  body: string;
};

function normalizeE164(phone: string): string | null {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith("1")) return `+${digits}`;
  if (digits.length >= 10 && phone.trim().startsWith("+")) return `+${digits}`;
  return null;
}

/** Sends via Twilio when configured; otherwise no-op (returns false). */
export async function sendSms(params: SendSmsParams): Promise<boolean> {
  const sid = process.env.TWILIO_ACCOUNT_SID?.trim();
  const token = process.env.TWILIO_AUTH_TOKEN?.trim();
  const messagingServiceSid = process.env.TWILIO_MESSAGING_SERVICE_SID?.trim();
  if (!sid || !token || !messagingServiceSid) return false;

  const to = normalizeE164(params.to);
  if (!to) return false;

  const auth = Buffer.from(`${sid}:${token}`).toString("base64");
  const body = new URLSearchParams({
    To: to,
    MessagingServiceSid: messagingServiceSid,
    Body: params.body,
  });

  const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: body.toString(),
  });

  if (!res.ok) {
    console.error("twilio", await res.text());
    return false;
  }
  return true;
}
