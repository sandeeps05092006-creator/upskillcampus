import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { ArrowRight, LinkIcon, SearchX } from "lucide-react";

import { Button } from "@/components/ui/button";
import { resolveShortCode } from "@/lib/urls.functions";

export const Route = createFileRoute("/$shortCode")({
  loader: async ({ params }) => {
    const { originalUrl } = await resolveShortCode({ data: { code: params.shortCode } });
    if (originalUrl) throw redirect({ href: originalUrl, reloadDocument: true });
    return { shortCode: params.shortCode };
  },
  head: () => ({
    meta: [
      { title: "Short URL Not Found — QuickLink" },
      {
        name: "description",
        content: "This QuickLink short URL doesn't exist, was mistyped, or has been deleted.",
      },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Short URL Not Found — QuickLink" },
      { property: "og:description", content: "This QuickLink short URL is no longer available." },
    ],
  }),
  component: ShortCodeNotFound,
});

function ShortCodeNotFound() {
  const { shortCode } = Route.useLoaderData();

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-xl flex-col items-center justify-center px-4 py-16 text-center">
      <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
        <SearchX className="h-8 w-8" />
      </span>
      <p className="mt-6 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
        Error 404
      </p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">Short URL Not Found</h1>
      <p className="mt-4 text-muted-foreground">
        We couldn't find a destination for{" "}
        <span className="font-mono font-semibold text-foreground">/{shortCode}</span>. The link may
        have been mistyped, expired, or deleted by its creator.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Button asChild className="gap-2 shadow-[var(--shadow-brand)]">
          <Link to="/">
            <LinkIcon className="h-4 w-4" />
            Shorten a new URL
          </Link>
        </Button>
        <Button asChild variant="outline" className="gap-2">
          <Link to="/history">
            Browse all links
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
