import { Check, Copy, ExternalLink, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";

import type { UrlRecord } from "@/lib/urls.functions";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export function useOrigin() {
  const [origin, setOrigin] = useState("");
  if (typeof window !== "undefined" && origin === "" && window.location.origin) {
    // safe: derived from a stable browser value, set once during client render
    queueMicrotask(() => setOrigin(window.location.origin));
  }
  return origin;
}

export function CopyButton({ value, label = "Copy" }: { value: string; label?: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      const el = document.createElement("textarea");
      el.value = value;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      el.remove();
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <Button type="button" variant="outline" size="sm" onClick={copy} className="gap-1.5">
      {copied ? <Check className="h-4 w-4 text-primary" /> : <Copy className="h-4 w-4" />}
      {copied ? "Copied!" : label}
    </Button>
  );
}

export function formatDate(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

type Props = {
  urls: UrlRecord[];
  origin: string;
  onDelete?: (id: string) => void;
  deletingId?: string | null;
};

export function UrlTable({ urls, origin, onDelete, deletingId }: Props) {
  if (urls.length === 0) {
    return (
      <p className="px-5 py-10 text-center text-sm text-muted-foreground">
        No links yet — shorten your first URL from the home page.
      </p>
    );
  }

  return (
    <div className="divide-y divide-border">
      <div className="hidden grid-cols-[minmax(0,2.2fr)_minmax(0,1.4fr)_auto_auto] items-center gap-4 px-5 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground md:grid">
        <span>Original URL</span>
        <span>Short URL</span>
        <span className="text-right">Clicks</span>
        <span className="text-right">Created</span>
      </div>

      {urls.map((url) => {
        const shortUrl = `${origin}/${url.short_code}`;
        return (
          <div
            key={url.id}
            className="grid gap-3 px-5 py-4 transition-colors hover:bg-secondary/50 md:grid-cols-[minmax(0,2.2fr)_minmax(0,1.4fr)_auto_auto] md:items-center md:gap-4"
          >
            <a
              href={url.original_url}
              target="_blank"
              rel="noreferrer noopener"
              className="truncate text-sm text-foreground hover:text-primary hover:underline"
              title={url.original_url}
            >
              {url.original_url}
            </a>

            <div className="flex min-w-0 items-center gap-2">
              <a
                href={shortUrl}
                target="_blank"
                rel="noreferrer noopener"
                className="truncate font-mono text-sm font-medium text-primary hover:underline"
              >
                /{url.short_code}
              </a>
            </div>

            <div className="flex items-center gap-3 md:justify-end">
              <span className="rounded-full bg-secondary px-2.5 py-1 text-xs font-semibold text-secondary-foreground">
                {url.clicks} {url.clicks === 1 ? "click" : "clicks"}
              </span>
              <span className="text-xs text-muted-foreground md:hidden">
                {formatDate(url.created_at)}
              </span>
            </div>

            <div className="flex flex-wrap items-center justify-start gap-2 md:justify-end">
              <span className="hidden text-xs text-muted-foreground md:mr-2 md:inline">
                {formatDate(url.created_at)}
              </span>
              <CopyButton value={shortUrl} />
              <Button asChild variant="outline" size="sm" className="gap-1.5">
                <a href={shortUrl} target="_blank" rel="noreferrer noopener">
                  <ExternalLink className="h-4 w-4" />
                  Open
                </a>
              </Button>
              {onDelete && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={deletingId === url.id}
                      className="gap-1.5 text-destructive hover:bg-destructive/10 hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete this short link?</AlertDialogTitle>
                      <AlertDialogDescription>
                        /{url.short_code} will stop working immediately and its click history will
                        be removed. This cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => onDelete(url.id)}>Delete</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
