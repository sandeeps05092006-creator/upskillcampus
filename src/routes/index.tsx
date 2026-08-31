import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  ExternalLink,
  Link2,
  Shield,
  X,
  Zap,
} from "lucide-react";
import { useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CopyButton, useOrigin } from "@/components/UrlTable";
import { validateLongUrl } from "@/lib/short-code";
import { shortenUrl, type UrlRecord } from "@/lib/urls.functions";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "QuickLink — Shorten Your URLs in Seconds" },
      {
        name: "description",
        content:
          "QuickLink turns long, messy links into short, shareable URLs with live click tracking. Free, fast, and no signup required.",
      },
      { property: "og:title", content: "QuickLink — Shorten Your URLs in Seconds" },
      {
        property: "og:description",
        content: "Turn long links into short, trackable URLs in one click.",
      },
    ],
  }),
  component: Home,
});

function Home() {
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<UrlRecord | null>(null);
  const origin = useOrigin();
  const shorten = useServerFn(shortenUrl);

  const mutation = useMutation({
    mutationFn: (url: string) => shorten({ data: { url } }),
    onSuccess: (data) => {
      setResult(data);
      setError(null);
    },
    onError: (err: Error) => {
      setResult(null);
      setError(err.message || "Something went wrong. Please try again.");
    },
  });

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const check = validateLongUrl(value);
    if (!check.ok) {
      setError(check.error);
      setResult(null);
      return;
    }
    setError(null);
    mutation.mutate(check.url);
  };

  const shortUrl = result ? `${origin}/${result.short_code}` : "";

  return (
    <div>
      <section className="relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 -top-40 h-[28rem] bg-[var(--gradient-hero)] blur-3xl"
        />
        <div className="relative mx-auto max-w-3xl px-4 pb-16 pt-16 text-center sm:px-6 sm:pt-24">
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3.5 py-1.5 text-xs font-medium text-muted-foreground shadow-sm">
            <Zap className="h-3.5 w-3.5 text-primary" />
            Free · No signup · Instant links
          </span>

          <h1 className="mt-6 text-4xl font-bold tracking-tight text-foreground sm:text-6xl">
            Shorten Your URLs <span className="text-primary">in Seconds</span>
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-base text-muted-foreground sm:text-lg">
            Paste a long, messy link and QuickLink gives you a short, clean URL that's easy to share
            — with click tracking built in.
          </p>

          <form onSubmit={onSubmit} className="mx-auto mt-9 w-full max-w-2xl">
            <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-3 shadow-[var(--shadow-card)] sm:flex-row sm:items-center">
              <div className="flex flex-1 items-center gap-2 px-2">
                <Link2 className="h-5 w-5 shrink-0 text-muted-foreground" />
                <Input
                  value={value}
                  onChange={(e) => {
                    setValue(e.target.value);
                    if (error) setError(null);
                  }}
                  inputMode="url"
                  aria-label="Long URL"
                  aria-invalid={Boolean(error)}
                  placeholder="https://example.com/my/very/long/link"
                  className="h-12 border-0 bg-transparent px-0 text-base shadow-none focus-visible:ring-0"
                />
              </div>
              <Button
                type="submit"
                size="lg"
                disabled={mutation.isPending}
                className="h-12 w-full gap-2 rounded-xl px-6 text-base font-semibold shadow-[var(--shadow-brand)] transition-transform hover:-translate-y-0.5 sm:w-auto"
              >
                {mutation.isPending ? "Shortening…" : "Shorten URL"}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
            {error && (
              <p role="alert" className="mt-3 text-left text-sm font-medium text-destructive sm:pl-4">
                {error}
              </p>
            )}
          </form>

          {result && (
            <div className="mx-auto mt-8 w-full max-w-2xl animate-in fade-in slide-in-from-bottom-3 duration-500">
              <div className="rounded-2xl border border-primary/25 bg-card p-6 text-left shadow-[var(--shadow-card)]">
                <p className="flex items-center gap-2 text-sm font-semibold text-primary">
                  <CheckCircle2 className="h-4.5 w-4.5" />
                  Success! Your short link is ready.
                </p>

                <dl className="mt-5 space-y-4">
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Original URL
                    </dt>
                    <dd className="mt-1 truncate text-sm text-foreground" title={result.original_url}>
                      {result.original_url}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Shortened URL
                    </dt>
                    <dd className="mt-1 break-all font-mono text-lg font-semibold text-primary">
                      {shortUrl}
                    </dd>
                  </div>
                </dl>

                <div className="mt-5 flex flex-wrap gap-2">
                  <CopyButton value={shortUrl} label="Copy" />
                  <Button asChild variant="outline" size="sm" className="gap-1.5">
                    <a href={shortUrl} target="_blank" rel="noreferrer noopener">
                      <ExternalLink className="h-4 w-4" />
                      Open
                    </a>
                  </Button>
                  <Button asChild variant="ghost" size="sm" className="gap-1.5">
                    <Link to="/history">
                      View all links
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            {
              icon: Zap,
              title: "Instant shortening",
              body: "Unique 6–8 character codes generated with cryptographic randomness and checked for collisions.",
            },
            {
              icon: BarChart3,
              title: "Real click tracking",
              body: "Every visit to a QuickLink increments a counter you can follow on the dashboard.",
            },
            {
              icon: Shield,
              title: "Validated & safe",
              body: "Only well-formed http:// and https:// links are accepted, with clear inline errors.",
            },
          ].map((f) => (
            <div
              key={f.title}
              className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)] transition-all hover:-translate-y-1 hover:border-primary/30"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <f.icon className="h-5 w-5" />
              </span>
              <h2 className="mt-4 text-base font-semibold text-foreground">{f.title}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{f.body}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
