# CallAI — live SEO data for AI agents

[![npm](https://img.shields.io/npm/v/@callaiapi/seo?logo=npm&color=cb3837)](https://www.npmjs.com/package/@callaiapi/seo)
[![license](https://img.shields.io/npm/l/@callaiapi/seo?color=blue)](./LICENSE)

[中文说明](./README.zh.md)

CallAI gives your AI agent real search data instead of guesses: live Google and Bing results (including the Google AI Overview and the sites it cites), keyword volume and difficulty, long-tail ideas, competitor keyword gaps, domain traffic, backlinks and on-page audits.

It works two ways:

- **DeepSeek Harness (dsh) plugin** — this npm package, `@callaiapi/seo`. Installs the tools plus a `callai-seo` skill that teaches the agent how to do keyword research, competitor analysis, GEO checks and audits.
- **Remote MCP server** — `https://api.callaiapi.com/mcp`, for Claude Code, Cursor, VS Code, Cline, Windsurf and any other MCP client. Nothing to install.

Data comes from [DataForSEO](https://dataforseo.com/). Paid tools bill your CallAI balance per call: top up from $1, no subscription, balance never expires. Every result states what that call cost. Seven free tools need only an API key. Anyone can list the tools without a key.

---

## Contents

- [1. Get an API key](#1-get-an-api-key)
- [2. Install in DeepSeek Harness](#2-install-in-deepseek-harness)
- [3. Use it in other MCP clients](#3-use-it-in-other-mcp-clients)
- [4. What to ask](#4-what-to-ask)
- [5. Tools reference](#5-tools-reference)
- [6. Markets: location and language codes](#6-markets-location-and-language-codes)
- [7. Pricing and cost control](#7-pricing-and-cost-control)
- [8. Troubleshooting](#8-troubleshooting)
- [9. FAQ](#9-faq)

---

## 1. Get an API key

1. Sign up at <https://callaiapi.com/register>.
2. Top up any amount from $1 (cards, Apple Pay / Google Pay, or USDT on several chains).
3. Create a key under **API Keys**: <https://callaiapi.com/portal?tab=keys>. It looks like `sk-live-…`. You can set a spend limit per key.

## 2. Install in DeepSeek Harness

Requires dsh 0.2.0 or later.

```sh
dsh plugin --profile web add @callaiapi/seo
```

Use your own profile name instead of `web` if you run another one (`ls ~/.dsh/profiles`). You can also install **@callaiapi/seo** from a plugin shop such as dsh-plugin-shop. Restart dsh afterwards — a newly added plugin is not loaded into a running process.

### Give the plugin your key

The plugin looks for the key in this order and uses the first one it finds:

| Where | How |
|---|---|
| Plugin setting `apiKey` | In the profile's `cordis.patch.yml` (below), or in the plugin's settings page if your dsh build shows one |
| dsh credential `CALLAI_API_KEY` | Saved through dsh's credential settings, or in `~/.dsh/.credentials.yaml` under `refs`, or in `~/.dsh/.env` (profiles with the credentials service, such as `web`) |
| Environment variable `CALLAI_API_KEY` | `CALLAI_API_KEY=sk-live-… dsh web` — works in every profile, including `headless` |

Profile patch, in `~/.dsh/profiles/<profile>/cordis.patch.yml`:

```yaml
- id: callai-seo
  config:
    apiKey: sk-live-your-key
```

`.env` file, in `~/.dsh/.env`:

```sh
CALLAI_API_KEY=sk-live-your-key
```

Saving the credential through dsh reconnects automatically; changes to the patch file, `.env` or the environment take effect after a dsh restart.

### Check it works

Start a session and ask *"Which mcp__callai tools do you have?"* — the agent should list 20 tools, and *"Audit https://example.com"* should come back with real data and a `billed_usd` line.

### Plugin settings

| Setting | Default | Meaning |
|---|---|---|
| `apiKey` | empty | Your CallAI key. Empty means: use the `CALLAI_API_KEY` credential or environment variable |
| `url` | `https://api.callaiapi.com/mcp` | MCP endpoint. Change only if you were given another one |
| `toolCallTimeoutMs` | `120000` | Per-call timeout; deep SERP and backlink calls can take up to a minute |

### Uninstall

```sh
dsh plugin --profile web remove @callaiapi/seo
```

## 3. Use it in other MCP clients

| Setting | Value |
|---|---|
| Transport | Streamable HTTP |
| URL | `https://api.callaiapi.com/mcp` |
| Header | `Authorization: Bearer sk-live-your-key` |

**Claude Code**

```sh
claude mcp add --transport http callai https://api.callaiapi.com/mcp \
  --header "Authorization: Bearer sk-live-your-key"
```

**Cursor** — `.cursor/mcp.json` in your project, or `~/.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "callai": {
      "url": "https://api.callaiapi.com/mcp",
      "headers": { "Authorization": "Bearer sk-live-your-key" }
    }
  }
}
```

**VS Code (Copilot agent mode)** — `.vscode/mcp.json`:

```json
{
  "inputs": [
    { "type": "promptString", "id": "callai-key", "description": "CallAI API key", "password": true }
  ],
  "servers": {
    "callai": {
      "type": "http",
      "url": "https://api.callaiapi.com/mcp",
      "headers": { "Authorization": "Bearer ${input:callai-key}" }
    }
  }
}
```

**Windsurf, Cline and other clients** — add a remote / Streamable HTTP server with the URL and header above. Clients that only support local (stdio) servers can bridge with `mcp-remote`:

```json
{
  "mcpServers": {
    "callai": {
      "command": "npx",
      "args": ["-y", "mcp-remote", "https://api.callaiapi.com/mcp", "--header", "Authorization:${AUTH_HEADER}"],
      "env": { "AUTH_HEADER": "Bearer sk-live-your-key" }
    }
  }
}
```

## 4. What to ask

You don't call tools yourself — describe the job and the agent picks the tools. Examples:

- *"Find long-tail keywords about standing desks for the UK with difficulty under 30, then check who ranks for the top three."*
- *"Compare my site example.com with competitor.com: traffic, the keywords they rank for that I don't, and backlink strength."*
- *"Does Google show an AI Overview for 'best crm for startups'? Which sites does it cite, and is mine one of them?"*
- *"Audit https://example.com/pricing and give me a fix list."*
- *"I'm about to buy the expired domain old-brand.com. Check its backlinks and spam score."*
- *"Get search volume and CPC for these 40 keywords in Germany, German language: …"*

## 5. Tools reference

In dsh the tools appear as `mcp__callai__<name>`; other clients show `<name>`. Every result is JSON with `billed_usd` (what the call cost) and `result`. Parameters marked * are required. Every tool except the backlink and audit tools also accepts `location_code` and `language_code` ([section 6](#6-markets-location-and-language-codes)).

| Tool | Parameters | Returns |
|---|---|---|
| `google_serp` | `keyword`*, `depth` 10–100 (default 10), `device` desktop/mobile | Ranked results (title, URL, domain, snippet); the AI Overview text with its cited sources when Google shows one |
| `bing_serp` | same as `google_serp` | Ranked Bing results |
| `keyword_overview` | `keywords`* (up to 100) | Per keyword: search volume, CPC, competition, keyword difficulty 0–100, main intent |
| `keyword_ideas` | `keyword`*, `limit` 1–200 (default 50), `max_difficulty` 0–100 | Long-tail keywords containing the seed, by volume, with the same metrics |
| `ranked_keywords` | `target`* domain, `limit` 1–200 (default 50) | Keywords the domain ranks for, by estimated traffic: position, ranking URL, metrics |
| `domain_overview` | `target`* domain | Estimated organic traffic, number of ranking keywords, position distribution, paid search totals |
| `keyword_gap` | `competitor`*, `your_domain`*, `limit` 1–200 (default 50) | Keywords the competitor ranks for and you don't, by volume, with the competitor's position and URL |
| `backlinks_summary` | `target`* domain | Domain rank 0–1000, backlinks, referring domains, nofollow count, broken backlinks, spam score, first seen |
| `referring_domains` | `target`* domain, `limit` 1–200 (default 50) | Linking domains, strongest first: rank, backlinks, spam score, first seen |
| `page_audit` | `url`* | Status code, title, meta description, canonical, headings, word count, link and image counts, timing, on-page score, all checks |
| `dataforseo_request` | `path`*, `method` POST/GET, `body` | Any other [DataForSEO v3 endpoint](https://docs.dataforseo.com/v3/) — Google Maps, YouTube, Amazon keywords, Google Trends, LLM mentions, WHOIS, technologies, async `task_post`/`task_get` |

| `domain_check_start` | `domains`* (up to 100), `dry_run`, `rules` | Starts a check of archive history, Baidu index and backlinks. Charged per domain, about $0.02; `dry_run` returns the cost without charging |
| `domain_check_results` | `check_id`*, `verdict`, `limit`, `after` | Progress and per-domain verdict, reason and facts. Free to read |

### Free tools

These need an API key but no balance, within a daily allowance of 200 units per account. `keyword_suggestions` counts 1 unit in `seed` mode, 3 in `questions` and 5 in `az`; the others count 1.

| Tool | Parameters | Returns |
|---|---|---|
| `keyword_suggestions` | `keyword`*, `engines`, `market`, `mode` seed/questions/az | Autocomplete suggestions from Google, Bing, YouTube, Amazon, Baidu, DuckDuckGo, Yahoo and Yandex. No search volume |
| `check_robots` | `url`* | Status and contents of robots.txt |
| `check_sitemap` | `url`* | Sitemaps found through robots.txt or /sitemap.xml: status, URL count, sample |
| `page_meta` | `url`*, `fetch_as` bot/googlebot | Status, final URL, title, description, canonical, robots, X-Robots-Tag, hreflang, H1s, from raw HTML |
| `redirect_chain` | `url`* | Status and target of every redirect, up to 5 |
| `dns_lookup` | `domain`* | A, AAAA, CNAME, MX, NS and TXT records |
| `email_auth_check` | `domain`*, `dkim_selector` | MX, SPF, DKIM, DMARC and MTA-STS records, with an audit of what to fix |

Domains can be given as `example.com`, `www.example.com` or a full URL.

## 6. Markets: location and language codes

Default market: United States (`location_code` 2840), English (`language_code` en). Tell the agent the market in plain words ("for Germany, in German") and it sets the codes.

| Market | `location_code` | Typical `language_code` |
|---|---|---|
| United States | 2840 | en |
| United Kingdom | 2826 | en |
| Canada | 2124 | en / fr |
| Australia | 2036 | en |
| Germany | 2276 | de |
| France | 2250 | fr |
| Spain | 2724 | es |
| Italy | 2380 | it |
| Brazil | 2076 | pt |
| Japan | 2392 | ja |
| India | 2356 | en / hi |

Full list: [DataForSEO locations](https://docs.dataforseo.com/v3/serp/google/locations/).

## 7. Pricing and cost control

Calls are billed at the DataForSEO cost plus CallAI's margin; the exact amount is in each result's `billed_usd` and in your console call log. Typical costs:

| Call | Approx. cost |
|---|---|
| `google_serp` / `bing_serp`, 10 results | $0.0024 |
| `keyword_overview`, 10 keywords | $0.013 |
| `keyword_ideas` / `ranked_keywords` / `keyword_gap`, 50 rows | $0.018 |
| `domain_overview` | $0.015 |
| `backlinks_summary` | $0.029 |
| `referring_domains`, 50 rows | about $0.03 |
| `page_audit` | $0.0002 |

A full keyword research session (ideas → metrics → SERP checks for five keywords) usually costs well under $0.10.

To keep spend predictable:

- Set a **spend limit** on the key in the console; calls stop when it is reached.
- The bundled skill tells the agent to batch keywords, start with small limits, and say before a run that would cost more than about $0.50.
- When the balance runs out, tools return *"Insufficient CallAI balance"* with the top-up link; nothing is charged for refused calls.

## 8. Troubleshooting

| Problem | Fix |
|---|---|
| No `mcp__callai__` tools in dsh | Restart dsh after installing. Check the key is set ([section 2](#give-the-plugin-your-key)); without a key the plugin logs `[callai-seo] No API key` and adds no tools |
| `401` / "Invalid or inactive API key" | Use the full key including `sk-live-`; check it is active in the console |
| `429` "spend limit reached" | Raise the key's spend limit or use another key |
| "Insufficient CallAI balance" | Top up at <https://callaiapi.com/portal?tab=topup> |
| `Task failed (40501): Invalid Field …` | A parameter is wrong (for example an unsupported language for that market). Ask the agent to retry with corrected values |
| A call times out | Lower `depth` or `limit`, or raise `toolCallTimeoutMs` |
| dsh says the plugin is incompatible | Update dsh: `npm i -g @deepseek-ai/dsh` |

## 9. FAQ

**Is there a free tier?** No. New accounts start at $0 and you top up from $1; there is no subscription and no minimum monthly spend.

**Where does the data come from?** DataForSEO's live SERP, Labs, Backlinks and On-Page APIs. SERP results are fetched live at call time; keyword metrics and backlink indexes are DataForSEO's latest databases.

**What do you store?** For billing and your call log: the endpoint, status, cost and timing of each call. Keywords and domains are sent to DataForSEO to answer the request.

**Can I call the API without an agent?** Yes — the same data is available as a REST API at `https://api.callaiapi.com/dataforseo/v3/...` with DataForSEO's request format. See <https://callaiapi.com/en/dataforseo>.

**I already have a DataForSEO account.** Then you can use DataForSEO directly. CallAI is for people who want pay-as-you-go from $1 without a minimum deposit, one balance shared with LLM APIs, and an agent-ready MCP server.

## Links

- Setup guide: <https://callaiapi.com/en/integrations/seo-mcp>
- Console: <https://callaiapi.com/portal>
- Issues: <https://github.com/hanshengcc/callai-seo-mcp/issues>

## License

MIT
