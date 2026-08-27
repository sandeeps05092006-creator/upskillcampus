import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ArrowRight, BarChart3, Link2, MousePointerClick, TrendingUp } from "lucide-react";

import { Button } from "@/components/ui/button";
import { UrlTable, useOrigin } from "@/components/UrlTable";
import { listUrls } from "@/lib/urls.functions";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — QuickLink Analytics" },
      {
        name: "description",
        content:
          "See how your QuickLink short URLs perform: total links created, total clicks, and your most recent links.",
      },
      { property: "og:title", content: "Dashboard — QuickLink Analytics" },
      {
        property: "og:description",
        content: "Total links, total clicks and recent activity for your QuickLink short URLs.",
      },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const origin = useOrigin();
  const fetchUrls = useServerFn(listUrls);
  const { data, isPending, isError } = useQuery({
    queryKey: ["urls"],
    queryFn: () => fetchUrls({}),
  });

  const avg =
    data && data.totalUrls > 0 ? (data.totalClicks / data.totalUrls).toFixed(1) : "0.0";

  const stats = [
    { label: "Total URLs shortened", value: data?.totalUrls ?? 0, icon: Link2 },
    { label: "Total clicks", value: data?.totalClicks ?? 0, icon: MousePointerClick },
    { label: "Average clicks per link", value: avg, icon: TrendingUp },
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Dashboard</h1>
          <p className="mt-2 text-muted-foreground">
            A live overview of every link created with QuickLink.
          </p>
        </div>
        <Button asChild variant="outline" className="gap-2">
          <Link to="/history">
            Full history
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {stats.map((s) => (
          <div
            key={s.label}
            className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)]"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-muted-foreground">{s.label}</p>
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <s.icon className="h-4.5 w-4.5" />
              </span>
            </div>
            <p className="mt-4 text-4xl font-bold tracking-tight">
              {isPending ? "—" : s.value}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-10 overflow-hidden rounded-2xl border border-border bg-card shadow-[var(--shadow-card)]">
        <div className="flex items-center gap-2 border-b border-border px-5 py-4">
          <BarChart3 className="h-4.5 w-4.5 text-primary" />
          <h2 className="text-base font-semibold">Recently created URLs</h2>
        </div>
        {isPending && <p className="px-5 py-10 text-center text-sm text-muted-foreground">Loading…</p>}
        {isError && (
          <p className="px-5 py-10 text-center text-sm text-destructive">
            Could not load your links. Please refresh the page.
          </p>
        )}
        {data && <UrlTable urls={data.urls.slice(0, 10)} origin={origin} />}
      </div>
    </div>
  );
}
