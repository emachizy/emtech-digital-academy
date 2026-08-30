import { describe, expect, it } from "vitest";
import { feedbackReadyEmail, submissionReceivedEmail } from "./templates";

describe("submissionReceivedEmail", () => {
  it("includes the student name, project title and link", () => {
    const { subject, html } = submissionReceivedEmail({
      studentName: "Alex Johnson",
      projectTitle: "Portfolio Website",
      projectUrl: "https://example.com/projects/portfolio-website",
      logoUrl: "https://example.com/logo-icon.png",
    });
    expect(subject).toContain("Portfolio Website");
    expect(html).toContain("Alex Johnson");
    expect(html).toContain("Portfolio Website");
    expect(html).toContain("https://example.com/projects/portfolio-website");
  });

  it("escapes HTML in the student name to prevent injection", () => {
    const { html } = submissionReceivedEmail({
      studentName: "<img src=x onerror=alert(1)>",
      projectTitle: "Weather App",
      projectUrl: "https://example.com/projects/weather-app",
      logoUrl: "https://example.com/logo-icon.png",
    });
    expect(html).not.toContain("<img src=x onerror=alert(1)>");
    expect(html).toContain("&lt;img src=x onerror=alert(1)&gt;");
  });
});

describe("feedbackReadyEmail", () => {
  it("renders the decision, score and mentor name", () => {
    const { subject, html } = feedbackReadyEmail({
      studentName: "Alex Johnson",
      projectTitle: "Weather App",
      mentorName: "Sarah Johnson",
      decision: "approved",
      score: 92,
      projectUrl: "https://example.com/projects/weather-app",
      logoUrl: "https://example.com/logo-icon.png",
    });
    expect(subject).toContain("Weather App");
    expect(html).toContain("Sarah Johnson");
    expect(html).toContain("approved");
    expect(html).toContain("92/100");
  });

  it("includes the comment block only when a comment is provided", () => {
    const withComment = feedbackReadyEmail({
      studentName: "Alex",
      projectTitle: "Weather App",
      mentorName: "Sarah",
      decision: "changes_requested",
      score: 60,
      comment: "Please handle the loading state.",
      projectUrl: "https://example.com/projects/weather-app",
      logoUrl: "https://example.com/logo-icon.png",
    });
    expect(withComment.html).toContain("Please handle the loading state.");

    const withoutComment = feedbackReadyEmail({
      studentName: "Alex",
      projectTitle: "Weather App",
      mentorName: "Sarah",
      decision: "rejected",
      score: 40,
      projectUrl: "https://example.com/projects/weather-app",
      logoUrl: "https://example.com/logo-icon.png",
    });
    expect(withoutComment.html).not.toContain("Please handle");
  });

  it("escapes HTML in the comment to prevent injection", () => {
    const { html } = feedbackReadyEmail({
      studentName: "Alex",
      projectTitle: "Weather App",
      mentorName: "Sarah",
      decision: "approved",
      score: 90,
      comment: "<script>alert(1)</script>",
      projectUrl: "https://example.com/projects/weather-app",
      logoUrl: "https://example.com/logo-icon.png",
    });
    expect(html).not.toContain("<script>");
    expect(html).toContain("&lt;script&gt;");
  });
});
