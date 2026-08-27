import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Database, KeyRound, MousePointerClick, Send } from "lucide-react";

import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About QuickLink — How Our URL Shortener Works" },
      {
        name: "description",
        content:
          "Learn how QuickLink generates unique short codes, stores link mappings, redirects visitors and counts every click.",
      },
      { property: "og:title", content: "About QuickLink — How Our URL Shortener Works" },
      {
        property: "og:description",
        content: "The technology and flow behind QuickLink's short URLs and click tracking.",
      },
    ],
  }),
  component: About,
});

const STEPS = [
  {
    icon: Send,
    title: "1. You submit a long URL",
    body: "The link is validated on both the client and the server — it must be a well-formed http:// or https:// address.",
  },
  {
    icon: KeyRound,
    title: "2. A unique code is generated",
    body: "A 6–8 character code of letters and numbers is created with a cryptographic random generator, then checked against the database so no two links ever collide.",
  },
  {
    icon: Database,
    title: "3. The mapping is stored",
    body: "The original URL, its short code, a click counter and a creation timestamp are saved permanently in the urls database table.",
  },
  {
    icon: MousePointerClick,
    title: "4. Visits redirect and count",
    body: "Opening the short URL hits a real server route that looks up the code, increments the click counter atomically and redirects the visitor to the original destination.",
  },
];

function About() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">About QuickLink</h1>
      <p className="mt-4 text-lg text-muted-foreground">
        QuickLink is a free URL shortener that turns long, unwieldy web addresses into short links
        that are easy to share in messages, slides, emails and print — and it tells you how many
        times each one has been opened.
      </p>

      <h2 className="mt-12 text-xl font-semibold">How it works</h2>
      <div className="mt-6 space-y-4">
        {STEPS.map((step) => (
          <div
            key={step.title}
            className="flex gap-4 rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-card)]"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <step.icon className="h-5 w-5" />
            </span>
            <div>
              <h3 className="font-semibold">{step.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{step.body}</p>
            </div>
          </div>
        ))}
      </div>

      <h2 className="mt-12 text-xl font-semibold">Developer API</h2>
      <p className="mt-3 text-sm text-muted-foreground">
        QuickLink exposes a small JSON API so you can shorten links from your own scripts.
      </p>
      <pre className="mt-4 overflow-x-auto rounded-2xl border border-border bg-secondary/60 p-5 text-xs leading-relaxed">
        {`POST /api/public/shorten
Content-Type: application/json

{ "url": "https://example.com/a/very/long/link" }

→ 200 OK
{
  "original_url": "https://example.com/a/very/long/link",
  "short_code": "aB3xY9",
  "short_url": "https://your-domain.com/aB3xY9"
}`}
      </pre>
      <p className="mt-3 text-sm text-muted-foreground">
        <code className="font-mono">GET /api/public/urls</code> returns totals plus every stored
        link for the dashboard and history views.
      </p>

      <div className="mt-12 rounded-2xl border border-primary/25 bg-card p-6 text-center shadow-[var(--shadow-card)]">
        <h2 className="text-lg font-semibold">Ready to shorten a link?</h2>
        <p className="mt-2 text-sm text-muted-foreground">It takes about two seconds.</p>
        <Button asChild className="mt-5 gap-2 shadow-[var(--shadow-brand)]">
          <Link to="/">
            Shorten a URL
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
