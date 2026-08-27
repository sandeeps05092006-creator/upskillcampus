import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { generateShortCode, validateLongUrl } from "./short-code";

export type UrlRecord = {
  id: string;
  original_url: string;
  short_code: string;
  clicks: number;
  created_at: string;
};

export const shortenUrl = createServerFn({ method: "POST" })
  .inputValidator((input: { url: string }) => z.object({ url: z.string() }).parse(input))
  .handler(async ({ data }) => {
    const check = validateLongUrl(data.url);
    if (!check.ok) throw new Error(check.error);

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
        .select("id, original_url, short_code, clicks, created_at")
        .single();

      if (error) {
        if (error.code === "23505") continue; // collision race, retry
        throw new Error("Could not save the short link. Please try again.");
      }
      return inserted as UrlRecord;
    }
    throw new Error("Could not generate a unique short code. Please try again.");
  });

export const listUrls = createServerFn({ method: "GET" }).handler(async () => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin
    .from("urls")
    .select("id, original_url, short_code, clicks, created_at")
    .order("created_at", { ascending: false })
    .limit(500);
  if (error) throw new Error("Could not load links.");
  const urls = (data ?? []) as UrlRecord[];
  return {
    urls,
    totalUrls: urls.length,
    totalClicks: urls.reduce((sum, u) => sum + u.clicks, 0),
  };
});

export const deleteUrl = createServerFn({ method: "POST" })
  .inputValidator((input: { id: string }) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("urls").delete().eq("id", data.id);
    if (error) throw new Error("Could not delete the link.");
    return { success: true };
  });

/** Looks up a short code, increments its click counter, returns the destination. */
export const resolveShortCode = createServerFn({ method: "GET" })
  .inputValidator((input: { code: string }) => z.object({ code: z.string() }).parse(input))
  .handler(async ({ data }) => {
    if (!/^[A-Za-z0-9]{4,16}$/.test(data.code)) return { originalUrl: null };
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: url, error } = await supabaseAdmin.rpc("increment_clicks", {
      _short_code: data.code,
    });
    if (error) return { originalUrl: null };
    return { originalUrl: (url as string | null) ?? null };
  });
