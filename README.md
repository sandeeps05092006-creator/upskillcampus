# QuickLink – URL Shortener

**Short URLs. Simple Sharing.**

QuickLink is a full-stack URL shortener web application. Paste a long URL, get a short link
(e.g. `https://your-domain.com/aB3xY9`), share it anywhere, and watch a real click counter grow
every time somebody opens it. All data is stored permanently in a PostgreSQL database — there is
no mock or demo data anywhere in the app.

---

## Features

- **URL shortening** — 6–8 character codes (letters + numbers) generated with a cryptographically
  secure random source and checked against the database for uniqueness before insert.
- **Real redirects** — visiting `/<short_code>` performs a genuine server-side lookup and HTTP
  redirect to the original URL.
- **Click tracking** — every redirect atomically increments the link's `clicks` counter through a
  `SECURITY DEFINER` database function.
- **Validation** — URLs must start with `http://` or `https://`, be well-formed and have a valid
  host. Empty or invalid input produces clear inline error messages.
- **Copy & Open** — one-click clipboard copy with a "Copied!" confirmation, plus an Open button.
- **Dashboard** — total URLs shortened, total clicks, average clicks per link and the 10 most
  recent links.
- **URL History** — full searchable list of all links (filter by original URL or short code) with
  copy, open, click count and delete behind a confirmation dialog.
- **About page** — plain-language explanation of how the shortener works, plus API docs.
- **Custom 404** — a professional "Short URL Not Found" page for unknown short codes.
- **JSON API** — `POST /api/public/shorten` and `GET /api/public/urls`.
- **Responsive, modern SaaS UI** — rounded cards, subtle shadows, hover animations; the input and
  button stack vertically on mobile.

---

## Tech Stack

| Layer | Technology |
| --- | --- |
| Framework | TanStack Start (React 19, SSR, file-based routing) |
| Language | TypeScript |
| Build tool | Vite 7 |
| Styling | Tailwind CSS v4 + shadcn/ui components, Lucide icons |
| Data fetching | TanStack Query |
| Validation | Zod (server) + shared validator module (client) |
| Backend | TanStack server functions & server routes |
| Database | PostgreSQL via Lovable Cloud (Supabase) |
| Hosting | Lovable (edge runtime) |

> The original brief mentioned Flask/Python. Because the production hosting runs a JavaScript edge
> runtime, the backend is implemented with TanStack server functions and server routes instead —
> the architecture (validation → unique code generation → DB insert → redirect handler with click
> increment) is identical.

---

## Project Structure

```
src/
├── components/
│   ├── SiteNav.tsx           # Responsive navigation bar + footer
│   ├── UrlTable.tsx          # Shared link table, copy button, delete dialog
│   └── ui/                   # shadcn/ui primitives
├── lib/
│   ├── short-code.ts         # Random code generator + URL validation (shared)
│   └── urls.functions.ts     # Server functions: shorten, list, delete, resolve
├── routes/
│   ├── __root.tsx            # App shell: nav, footer, metadata, toaster
│   ├── index.tsx             # Home — hero + shorten form + result card
│   ├── dashboard.tsx         # Dashboard — stats + recent URLs
│   ├── history.tsx           # URL history — search, copy, open, delete
│   ├── about.tsx             # About + API documentation
│   ├── $shortCode.tsx        # Redirect handler + "Short URL Not Found" page
│   └── api/public/
│       ├── shorten.ts        # POST /api/public/shorten
│       └── urls.ts           # GET  /api/public/urls
└── styles.css                # Design tokens (colors, shadows, typography)
```

### Database schema — `urls`

| Column | Type | Notes |
| --- | --- | --- |
| `id` | `uuid` | Primary key, auto-generated |
| `original_url` | `text` | The destination link |
| `short_code` | `text` | Unique index — the code in the short URL |
| `clicks` | `integer` | Defaults to `0`, incremented on every redirect |
| `created_at` | `timestamptz` | Defaults to `now()` |

Row Level Security is enabled. Read/create/delete are open (QuickLink is a public tool with no
accounts), while the click-increment function is executable only by trusted server-side code.

---

## How URL Shortening Works

1. **Validate** — the submitted string is trimmed, length-checked and parsed with the WHATWG `URL`
   parser; only `http:`/`https:` schemes with a dotted hostname are accepted. The same validator
   runs in the browser (instant feedback) and on the server (authoritative).
2. **Generate** — `crypto.getRandomValues()` fills a byte buffer that is mapped onto a 62-character
   alphabet (`a–z`, `A–Z`, `0–9`), producing a 6-character code (7 characters after three attempts).
3. **Check uniqueness** — the code is looked up in `urls`; if it already exists a new one is drawn.
   The `short_code` column also carries a `UNIQUE` constraint, so a race that slips past the check
   raises `23505` and the insert is retried.
4. **Store** — the mapping is inserted with a parameterized query through the database client
   (no string-concatenated SQL anywhere).
5. **Redirect** — `GET /<short_code>` calls `increment_clicks(short_code)`, a `SECURITY DEFINER`
   PostgreSQL function that increments `clicks` and returns `original_url` in a single atomic
   statement. If a row is returned, the visitor is redirected; otherwise the 404 page renders.

---

## Setup & Run

```sh
git clone <repository-url>
cd quicklink
npm install
npm run dev          # http://localhost:8080
```

Other scripts:

```sh
npm run build        # production build
npm run preview      # preview the production build
npm run lint         # eslint
```

### Environment Variables

These are provisioned automatically by Lovable Cloud and written to `.env`; when self-hosting,
supply them yourself.

| Variable | Scope | Purpose |
| --- | --- | --- |
| `VITE_SUPABASE_URL` | client | Database/API base URL |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | client | Public (safe to expose) API key |
| `SUPABASE_URL` | server | Database/API base URL for server functions |
| `SUPABASE_SERVICE_ROLE_KEY` | server | Privileged key used by the redirect/insert handlers — **never** expose to the client |

No secrets are hardcoded in the source; all keys are read from the environment inside server-only
handlers.

---

## Example API Request / Response

**Shorten a URL**

```sh
curl -X POST https://your-domain.com/api/public/shorten \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com/a/very/long/link"}'
```

```json
{
  "original_url": "https://example.com/a/very/long/link",
  "short_code": "aB3xY9",
  "short_url": "https://your-domain.com/aB3xY9"
}
```

**Validation error (HTTP 400)**

```json
{ "error": "URL must start with http:// or https://" }
```

**Fetch stats & history**

```sh
curl https://your-domain.com/api/public/urls
```

```json
{
  "total_urls": 12,
  "total_clicks": 87,
  "urls": [
    {
      "id": "0f6f2f0e-...",
      "original_url": "https://example.com/a/very/long/link",
      "short_code": "aB3xY9",
      "short_url": "https://your-domain.com/aB3xY9",
      "clicks": 5,
      "created_at": "2026-08-27T15:09:00.000Z"
    }
  ]
}
```

**Redirect**

```
GET /aB3xY9  →  302 Location: https://example.com/a/very/long/link
```

---

## Future Improvements

- User accounts so each person sees only their own links, with per-user dashboards.
- Custom / branded short codes (vanity URLs) with availability checking.
- Link expiry dates and password-protected links.
- Rich analytics: clicks over time, referrer, country and device breakdown with charts.
- QR code generation and download for every short link.
- Rate limiting and malicious/phishing URL screening before a link is created.
- Bulk shortening via CSV upload and CSV export of history.
- API keys for authenticated programmatic access.

---

## License

Released for educational use as a college / internship submission project.
