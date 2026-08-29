export interface EmailSender {
  name: string;
  email: string;
}

/**
 * Named sender identities. Each must be a verified sender (or its domain
 * verified) in Brevo, or sends using it will fail.
 *
 * - noReply: automated notifications where no reply is expected or
 *   monitored (submission received, feedback ready, password changed, ...).
 *   This is what nearly every email in this app should use.
 * - info: informational/broadcast content (announcements, digests) where a
 *   reply might reasonably be read.
 * - contact: anything tied to a human support conversation.
 */
export const senders = {
  noReply: { name: "TechEdu", email: "no-reply@emtechdigitalacademy.com.ng" },
  info: { name: "TechEdu", email: "info@emtechdigitalacademy.com.ng" },
  contact: { name: "TechEdu", email: "contact@emtechdigitalacademy.com.ng" },
} as const satisfies Record<string, EmailSender>;
