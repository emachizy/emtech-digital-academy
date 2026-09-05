import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { ValidationError } from "@/lib/api/errors";
import { requireRole } from "@/lib/auth/middleware.server";
import { sendEmail, siteUrl } from "@/lib/email/brevo.server";
import { senders } from "@/lib/email/senders";
import { contactFormEmail } from "@/lib/email/templates";
import { createRequestSupabase } from "@/lib/supabase/request.server";

/** Fixed id so there is always exactly one row — see migration 0010. */
const SINGLETON_ID = "00000000-0000-0000-0000-000000000001";

export interface ContactInfo {
  email: string | null;
  phone: string | null;
  hours: string | null;
  address: string | null;
}

/**
 * No auth middleware — this is unconditionally public content, unlike the
 * portfolio's per-row is_public flag. RLS's `contact_info_select` policy
 * (using (true)) is the entire authorization story here; a plain
 * request-scoped client works fine even for a signed-out visitor, since
 * PostgREST just evaluates it as the anon role.
 */
export const getContactInfoFn = createServerFn({ method: "GET" }).handler(
  async (): Promise<ContactInfo> => {
    const supabase = createRequestSupabase();
    const { data, error } = await supabase
      .from("contact_info")
      .select("email, phone, hours, address")
      .eq("id", SINGLETON_ID)
      .maybeSingle();
    if (error) throw error;

    return {
      email: data?.email ?? null,
      phone: data?.phone ?? null,
      hours: data?.hours ?? null,
      address: data?.address ?? null,
    };
  },
);

const updateContactInfoInput = z.object({
  email: z.string().email().optional(),
  phone: z.string().max(50).optional(),
  hours: z.string().max(500).optional(),
  address: z.string().max(500).optional(),
});

export const updateContactInfoFn = createServerFn({ method: "POST" })
  .middleware([requireRole("admin")])
  .validator(updateContactInfoInput)
  .handler(async ({ context, data }) => {
    const { error } = await context.supabase
      .from("contact_info")
      .update({
        email: data.email || null,
        phone: data.phone || null,
        hours: data.hours || null,
        address: data.address || null,
      })
      .eq("id", SINGLETON_ID);
    if (error) throw error;

    return { ok: true };
  });

const contactFormInput = z.object({
  name: z.string().trim().min(1).max(100),
  email: z.string().email(),
  subject: z.string().trim().min(1).max(200),
  message: z.string().trim().min(1).max(4000),
  // Honeypot: real visitors never see or fill this field (hidden via CSS on
  // the form). No external CAPTCHA service is configured, so this is the
  // lightweight anti-spam measure in its place.
  company: z.string().max(0).optional(),
});

/**
 * Also public — anyone can submit the contact form without signing in.
 * Forwards the message to the site's own configured contact email via
 * Brevo rather than writing to the database; there is no inbox to read a
 * stored submission from, so email is the actual deliverable here.
 */
export const submitContactFormFn = createServerFn({ method: "POST" })
  .validator(contactFormInput)
  .handler(async ({ data }) => {
    if (data.company) {
      // Silently succeed for bots that fill the honeypot — no point telling
      // them they were caught.
      return { ok: true };
    }

    const supabase = createRequestSupabase();
    const { data: contact } = await supabase
      .from("contact_info")
      .select("email")
      .eq("id", SINGLETON_ID)
      .maybeSingle();
    const to = contact?.email || senders.contact.email;
    if (!to) throw new ValidationError("This form isn't accepting messages right now");

    const content = contactFormEmail({
      name: data.name,
      fromEmail: data.email,
      subject: data.subject,
      message: data.message,
      logoUrl: siteUrl("/logo-icon.png"),
    });
    await sendEmail({
      to: { email: to },
      sender: senders.contact,
      replyTo: { email: data.email, name: data.name },
      ...content,
    });

    return { ok: true };
  });
