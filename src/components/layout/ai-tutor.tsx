import { Send, Sparkles } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";

const prompts = [
  "Explain this lesson",
  "Explain this code",
  "Debug my code",
  "Give me an example",
  "Quiz me",
  "Give me a hint",
  "Summarize this topic",
];

export function AiTutor() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: "user" | "ai"; text: string }[]>([
    {
      role: "ai",
      text: "Hi Alex. I'm the TechEdu AI tutor. I'm in preview — responses are placeholders until the AI backend is connected.",
    },
  ]);
  const [draft, setDraft] = useState("");

  const send = (text: string) => {
    if (!text.trim()) return;
    setMessages((prev) => [
      ...prev,
      { role: "user", text },
      {
        role: "ai",
        text: "Preview mode: once the AI backend is connected I'll answer this using your current lesson, code and progress.",
      },
    ]);
    setDraft("");
  };

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        className="fixed bottom-20 right-4 z-40 gap-2 rounded-full shadow-[var(--shadow-lift)] md:bottom-6 md:right-6"
      >
        <Sparkles className="size-4" />
        Ask TechEdu AI
      </Button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent className="flex w-full flex-col gap-0 p-0 sm:max-w-md">
          <SheetHeader className="border-b border-border">
            <SheetTitle className="flex items-center gap-2">
              <Sparkles className="size-4 text-primary" /> TechEdu AI
              <Badge variant="outline" className="border-electric/30 bg-electric/10 text-electric">
                Preview
              </Badge>
            </SheetTitle>
            <SheetDescription>
              A preview of your future AI tutor. No AI backend is connected yet.
            </SheetDescription>
          </SheetHeader>

          <div className="flex-1 space-y-3 overflow-y-auto p-4">
            {messages.map((m, i) => (
              <div
                key={i}
                className={
                  m.role === "ai"
                    ? "max-w-[85%] rounded-xl rounded-tl-sm bg-muted p-3 text-sm text-foreground"
                    : "ml-auto max-w-[85%] rounded-xl rounded-tr-sm bg-primary p-3 text-sm text-primary-foreground"
                }
              >
                {m.text}
              </div>
            ))}
          </div>

          <div className="border-t border-border p-4">
            <div className="mb-3 flex flex-wrap gap-2">
              {prompts.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => send(p)}
                  className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
                >
                  {p}
                </button>
              ))}
            </div>
            <form
              className="flex gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                send(draft);
              }}
            >
              <Input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Ask about your lesson…"
                aria-label="Message the AI tutor"
              />
              <Button type="submit" size="icon" aria-label="Send">
                <Send className="size-4" />
              </Button>
            </form>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}