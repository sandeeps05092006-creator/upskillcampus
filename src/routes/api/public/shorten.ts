import { createFileRoute } from "@tanstack/react-router";

import { generateShortCode, validateLongUrl } from "@/lib/short-code";

export const Route = createFileRoute("/api/public/shorten")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let body: unknown;
        try {
          body = await request.json();
        } catch {
          return Response.json({ error: "Invalid JSON body." }, { status: 400 });
        }
        const check = validateLongUrl((body as { url?: unknown } | null)?.url);
        if (!check.ok) return Response.json({ error: check.error }, { status: 400 });

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

        for (let attempt = 0; attempt < 6; attempt++) {
          const shortCode = generateShortCode(attempt < 3 ? 6 : 7);
          const { data: existing } = await supabaseAdmin
            .from("urls")
            .select("id")
            .eq("short_code", shortCode)
            .maybeSingle();
          if (existing) continue;

          const { data: inserted, error } = await supabaseAdmin
            .from("urls")
            .insert({ original_url: check.url, short_code: shortCode })
            .select("original_url, short_code")
            .single();
          if (error) {
            if (error.code === "23505") continue;
            return Response.json({ error: "Could not save the short link." }, { status: 500 });
          }
          const origin = new URL(request.url).origin;
          return Response.json({
            original_url: inserted.original_url,
            short_code: inserted.short_code,
            short_url: `${origin}/${inserted.short_code}`,
          });
        }
        return Response.json({ error: "Could not generate a unique code." }, { status: 500 });
      },
    },
  },
});
