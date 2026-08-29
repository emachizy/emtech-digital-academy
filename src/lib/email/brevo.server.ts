import type { EmailSender } from "./senders";

/** Server-rendered emails have no window.location to build links from. */
export function siteUrl(path: string): string {
  const base = process.env["SITE_URL"] ?? "http://localhost:8080";
  return `${base}${path}`;
}

export interface SendEmailInput {
  to: { email: string; name?: string };
  sender: EmailSender;
  subject: string;
  html: string;
}

/**
 * Thin wrapper around Brevo's transactional email API. Server-only — never
 * import from client-reachable code (the .server.ts suffix enforces this at
 * build time).
 *
 * Callers should treat a failed send as non-fatal: wrap the call in
 * try/catch and log rather than let it fail the surrounding mutation (a
 * submission or a review is a real, already-committed action — an email
 * provider hiccup shouldn't roll back a user-visible feature it isn't part
 * of the correctness of).
 */
export async function sendEmail(input: SendEmailInput): Promise<void> {
  const apiKey = process.env["BREVO_API_KEY"];
  if (!apiKey) {
    throw new Error("BREVO_API_KEY must be set to send email");
  }

  const response = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      accept: "application/json",
      "content-type": "application/json",
      "api-key": apiKey,
    },
    body: JSON.stringify({
      sender: input.sender,
      to: [input.to],
      subject: input.subject,
      htmlContent: input.html,
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Brevo send failed (${response.status}): ${body}`);
  }
}
