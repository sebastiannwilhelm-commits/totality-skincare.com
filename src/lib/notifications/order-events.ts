import { SITE } from "@/config/store";

import { sendEmail } from "./email";
import { sendSms } from "./sms";

function appOrigin(): string {
  return process.env.NEXT_PUBLIC_APP_URL?.trim() || "http://localhost:3000";
}

export async function notifyOrderConfirmation(opts: {
  email: string;
  orderId: string;
  totalCents: number;
  currency: string;
  requiresRx: boolean;
  intakeToken?: string;
  smsNumber?: string | null;
}): Promise<void> {
  const total = (opts.totalCents / 100).toLocaleString("en-US", {
    style: "currency",
    currency: (opts.currency || "usd").toUpperCase(),
  });

  let rxBlock = "";
  if (opts.requiresRx && opts.intakeToken) {
    const intakeUrl = `${appOrigin()}/orders/prescription?token=${encodeURIComponent(opts.intakeToken)}`;
    rxBlock = `<p>Your order includes prescription items. Please complete the medical intake form: <a href="${intakeUrl}">${intakeUrl}</a></p>`;
  }

  const html = `
    <p>Thank you for your order with ${SITE.name}.</p>
    <p><strong>Order total:</strong> ${total}</p>
    ${rxBlock}
    <p>View your account: <a href="${appOrigin()}/account">${appOrigin()}/account</a></p>
  `;

  await sendEmail({
    to: opts.email,
    subject: `Order confirmation — ${SITE.name}`,
    html,
    text: `Thank you for your order. Total: ${total}.`,
  });

  if (opts.smsNumber) {
    await sendSms({
      to: opts.smsNumber,
      body: `Thanks for your order at ${SITE.name}. Total ${total}.`,
    });
  }
}

export async function notifyOrderShipped(opts: {
  email: string;
  trackingNumber?: string | null;
  carrier?: string | null;
  smsNumber?: string | null;
}): Promise<void> {
  const tracking = opts.trackingNumber
    ? `Tracking: ${opts.carrier ? `${opts.carrier} ` : ""}${opts.trackingNumber}`
    : "Your order has shipped.";

  await sendEmail({
    to: opts.email,
    subject: `Your order has shipped — ${SITE.name}`,
    html: `<p>${tracking}</p><p>Track: <a href="${appOrigin()}/pages/track-order">${appOrigin()}/pages/track-order</a></p>`,
    text: tracking,
  });

  if (opts.smsNumber && opts.trackingNumber) {
    await sendSms({ to: opts.smsNumber, body: `${SITE.name}: ${tracking}` });
  }
}

export async function notifyRxDecision(opts: {
  email: string;
  approved: boolean;
  smsNumber?: string | null;
}): Promise<void> {
  const subject = opts.approved
    ? `Prescription approved — ${SITE.name}`
    : `Prescription update — ${SITE.name}`;
  const body = opts.approved
    ? "Dr. Nicole approved your prescription order. We will prepare it for fulfillment."
    : "Your prescription order could not be approved. Our team will follow up if needed.";

  await sendEmail({ to: opts.email, subject, html: `<p>${body}</p>`, text: body });
  if (opts.smsNumber) {
    await sendSms({ to: opts.smsNumber, body: `${SITE.name}: ${body}` });
  }
}
