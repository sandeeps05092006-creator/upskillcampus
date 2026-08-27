import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { History, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { Input } from "@/components/ui/input";
import { UrlTable, useOrigin } from "@/components/UrlTable";
import { deleteUrl, listUrls } from "@/lib/urls.functions";

export const Route = createFileRoute("/history")({
  head: () => ({
    meta: [
      { title: "URL History — All Your QuickLink Short Links" },
      {
        name: "description",
        content:
          "Browse, search, copy, open and delete every short link created with QuickLink, along with its click count.",
      },
      { property: "og:title", content: "URL History — All Your QuickLink Short Links" },
      {
        property: "og:description",
        content: "Search and manage every short link created with QuickLink.",
      },
    ],
  }),
  component: HistoryPage,
});

function HistoryPage() {
  const [search, setSearch] = useState("");
  const origin = useOrigin();
  const queryClient = useQueryClient();
  const fetchUrls = useServerFn(listUrls);
  const removeUrl = useServerFn(deleteUrl);

  const { data, isPending, isError } = useQuery({
    queryKey: ["urls"],
    queryFn: () => fetchUrls({}),
  });

  const mutation = useMutation({
    mutationFn: (id: string) => removeUrl({ data: { id } }),
    onSuccess: () => {
      toast.success("Short link deleted");
      queryClient.invalidateQueries({ queryKey: ["urls"] });
    },
    onError: () => toast.error("Could not delete that link"),
  });

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!data) return [];
    if (!q) return data.urls;
    return data.urls.filter(
      (u) =>
        u.original_url.toLowerCase().includes(q) || u.short_code.toLowerCase().includes(q),
    );
  }, [data, search]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">URL History</h1>
      <p className="mt-2 text-muted-foreground">
        Every short link you've created, with clicks, copy, open and delete.
      </p>

      <div className="relative mt-8 max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by URL or short code…"
          aria-label="Search links"
          className="h-11 rounded-xl pl-9"
        />
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border border-border bg-card shadow-[var(--shadow-card)]">
        <div className="flex items-center justify-between gap-2 border-b border-border px-5 py-4">
          <div className="flex items-center gap-2">
            <History className="h-4.5 w-4.5 text-primary" />
            <h2 className="text-base font-semibold">All links</h2>
          </div>
          <span className="text-sm text-muted-foreground">
            {filtered.length} {filtered.length === 1 ? "link" : "links"}
          </span>
        </div>

        {isPending && <p className="px-5 py-10 text-center text-sm text-muted-foreground">Loading…</p>}
        {isError && (
          <p className="px-5 py-10 text-center text-sm text-destructive">
            Could not load your links. Please refresh the page.
          </p>
        )}
        {data && (
          <UrlTable
            urls={filtered}
            origin={origin}
            onDelete={(id) => mutation.mutate(id)}
            deletingId={mutation.isPending ? (mutation.variables ?? null) : null}
          />
        )}
      </div>
    </div>
  );
}
