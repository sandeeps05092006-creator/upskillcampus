import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/public/urls")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { data, error } = await supabaseAdmin
          .from("urls")
          .select("id, original_url, short_code, clicks, created_at")
          .order("created_at", { ascending: false })
          .limit(500);
        if (error) return Response.json({ error: "Could not load links." }, { status: 500 });

        const origin = new URL(request.url).origin;
        const urls = (data ?? []).map((u) => ({ ...u, short_url: `${origin}/${u.short_code}` }));
        return Response.json({
          total_urls: urls.length,
          total_clicks: urls.reduce((sum, u) => sum + u.clicks, 0),
          urls,
        });
      },
    },
  },
});
