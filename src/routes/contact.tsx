import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Clock, Mail, MapPin, Phone } from "lucide-react";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/lib/api";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — Emtech Digital Academy" },
      {
        name: "description",
        content: "Get in touch with Emtech Digital Academy — email, phone or send us a message.",
      },
      { property: "og:title", content: "Contact — Emtech Digital Academy" },
      {
        property: "og:description",
        content: "Get in touch with Emtech Digital Academy — email, phone or send us a message.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  const { data: contact } = useQuery({ queryKey: ["contact-info"], queryFn: api.getContactInfo });

  const details = [
    { icon: Mail, label: "E-mail", value: contact?.email },
    { icon: Phone, label: "Phone Number", value: contact?.phone },
    { icon: Clock, label: "Hours of Operation", value: contact?.hours },
    { icon: MapPin, label: "Address", value: contact?.address },
  ].filter((d) => d.value);

  return (
    <main className="min-h-screen bg-background">
      <SiteHeader />

      <div className="border-b border-border bg-muted/30 px-6 py-14 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Contact</h1>
      </div>

      <section className="mx-auto grid max-w-6xl gap-10 px-6 py-16 lg:grid-cols-2">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-primary">
            Contact details
          </p>
          <h2 className="mt-2 text-2xl font-bold tracking-tight text-foreground">
            Get in Touch with Us
          </h2>
          <p className="mt-3 text-sm text-muted-foreground">
            Have a question, comment or partnership idea? We'd love to hear from you — fill out the
            form or reach us directly using the details below.
          </p>

          <ul className="mt-8 space-y-6">
            {details.map((detail) => (
              <li key={detail.label} className="flex items-start gap-4">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary-soft text-primary">
                  <detail.icon className="size-4.5" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-foreground">{detail.label}</p>
                  <p className="whitespace-pre-line text-sm text-muted-foreground">
                    {detail.value}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div
          className="rounded-2xl p-8 text-primary-foreground"
          style={{ backgroundImage: "var(--gradient-hero)" }}
        >
          <h2 className="text-xl font-bold tracking-tight">Send us a message</h2>
          <p className="mt-2 text-sm text-primary-foreground/80">
            Have an inquiry? Send us a message below and we'll get back to you shortly.
          </p>
          <ContactForm />
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}

function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [company, setCompany] = useState(""); // honeypot — real visitors never see this field
  const [sending, setSending] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSending(true);
    try {
      await api.submitContactForm({
        name,
        email,
        subject,
        message,
        ...(company ? { company } : {}),
      });
      toast.success("Message sent — we'll get back to you shortly.");
      setName("");
      setEmail("");
      setSubject("");
      setMessage("");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Couldn't send. Try again.");
    } finally {
      setSending(false);
    }
  }

  return (
    <form onSubmit={(e) => void handleSubmit(e)} className="mt-6 space-y-4">
      <div
        aria-hidden="true"
        style={{ position: "absolute", left: "-9999px", width: 0, height: 0, overflow: "hidden" }}
      >
        <Label htmlFor="contact-company">Company</Label>
        <Input
          id="contact-company"
          tabIndex={-1}
          autoComplete="off"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="contact-name" className="text-primary-foreground/90">
          Your name
        </Label>
        <Input
          id="contact-name"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="border-white/20 bg-white/10 text-primary-foreground placeholder:text-primary-foreground/50"
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="contact-email" className="text-primary-foreground/90">
          Your email address
        </Label>
        <Input
          id="contact-email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border-white/20 bg-white/10 text-primary-foreground placeholder:text-primary-foreground/50"
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="contact-subject" className="text-primary-foreground/90">
          Subject
        </Label>
        <Input
          id="contact-subject"
          required
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className="border-white/20 bg-white/10 text-primary-foreground placeholder:text-primary-foreground/50"
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="contact-message" className="text-primary-foreground/90">
          Message
        </Label>
        <Textarea
          id="contact-message"
          rows={4}
          required
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="border-white/20 bg-white/10 text-primary-foreground placeholder:text-primary-foreground/50"
        />
      </div>

      <Button type="submit" variant="secondary" className="w-full" disabled={sending}>
        {sending ? "Sending…" : "Send message"}
      </Button>
    </form>
  );
}
