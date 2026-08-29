const BRAND_COLOR = "#6D4AFF";

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * Shared chrome for every transactional email — inline styles only (email
 * clients strip <style> blocks unpredictably). `bodyHtml` is trusted,
 * pre-built HTML; any user-supplied string embedded in it must already be
 * escaped by the caller (see escapeHtml above).
 */
function layout(bodyHtml: string): string {
  return `<!doctype html>
<html lang="en">
  <body style="margin:0;padding:0;background:#f5f5f7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f7;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" style="max-width:480px;background:#ffffff;border-radius:12px;overflow:hidden;">
            <tr>
              <td style="padding:24px 32px;border-bottom:1px solid #eeeeee;">
                <span style="font-size:16px;font-weight:700;color:${BRAND_COLOR};">TechEdu</span>
              </td>
            </tr>
            <tr>
              <td style="padding:32px;color:#1a1a1a;font-size:14px;line-height:1.6;">
                ${bodyHtml}
              </td>
            </tr>
            <tr>
              <td style="padding:20px 32px;border-top:1px solid #eeeeee;color:#8a8a8a;font-size:12px;">
                You're receiving this because you have an account on TechEdu.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

function button(label: string, href: string): string {
  return `<a href="${href}" style="display:inline-block;margin-top:20px;padding:10px 20px;background:${BRAND_COLOR};color:#ffffff;text-decoration:none;border-radius:8px;font-weight:600;font-size:14px;">${escapeHtml(label)}</a>`;
}

export interface EmailContent {
  subject: string;
  html: string;
}

export function submissionReceivedEmail(params: {
  studentName: string;
  projectTitle: string;
  projectUrl: string;
}): EmailContent {
  const name = escapeHtml(params.studentName);
  const title = escapeHtml(params.projectTitle);
  return {
    subject: `We received your "${params.projectTitle}" submission`,
    html: layout(`
      <p style="margin:0 0 12px;">Hi ${name},</p>
      <p style="margin:0 0 12px;">
        Your submission for <strong>${title}</strong> is in — a mentor will
        review it and get back to you with feedback.
      </p>
      ${button("View your submission", params.projectUrl)}
    `),
  };
}

export function feedbackReadyEmail(params: {
  studentName: string;
  projectTitle: string;
  mentorName: string;
  decision: "approved" | "changes_requested" | "rejected";
  score: number;
  comment?: string;
  projectUrl: string;
}): EmailContent {
  const name = escapeHtml(params.studentName);
  const title = escapeHtml(params.projectTitle);
  const mentor = escapeHtml(params.mentorName);

  const decisionCopy: Record<typeof params.decision, string> = {
    approved: "approved",
    changes_requested: "sent back with requested changes",
    rejected: "not approved this time",
  };

  return {
    subject: `Feedback on your "${params.projectTitle}" submission`,
    html: layout(`
      <p style="margin:0 0 12px;">Hi ${name},</p>
      <p style="margin:0 0 12px;">
        ${mentor} reviewed your <strong>${title}</strong> submission — it was
        <strong>${decisionCopy[params.decision]}</strong> (score: ${params.score}/100).
      </p>
      ${
        params.comment
          ? `<p style="margin:0 0 12px;padding:12px 16px;background:#f5f5f7;border-radius:8px;color:#444444;">${escapeHtml(params.comment)}</p>`
          : ""
      }
      ${button("View feedback", params.projectUrl)}
    `),
  };
}
