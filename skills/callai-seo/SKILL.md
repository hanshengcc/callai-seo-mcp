---
name: callai-seo
description: Live SEO data through the CallAI MCP tools (mcp__callai__*). Use for keyword research, competitor analysis, content planning, backlink checks, GEO/AI search visibility and SEO audits.
---

# CallAI SEO

The `mcp__callai__*` tools return live search data. Every call is billed to the user's CallAI balance and each result reports `billed_usd`. Answer from this data, not from memory, and cite the numbers you used.

## Tools

| Tool | Use it for | Approx. cost |
|---|---|---|
| `google_serp` | Who ranks for a query; the AI Overview text and the sites it cites | $0.0024 per 10 results |
| `bing_serp` | Same for Bing (feeds Copilot and ChatGPT search) | $0.0024 per 10 results |
| `keyword_overview` | Volume, CPC, difficulty (0–100), intent for up to 100 keywords | $0.012 + $0.00012/keyword |
| `keyword_ideas` | Long-tail keywords containing a seed; `max_difficulty` filters | $0.012 + $0.00012/row |
| `ranked_keywords` | Keywords a domain ranks for, by traffic | $0.012 + $0.00012/row |
| `domain_overview` | A domain's estimated organic traffic and position spread | $0.015 |
| `keyword_gap` | Keywords a competitor ranks for that the user's domain does not | $0.012 + $0.00012/row |
| `backlinks_summary` | Domain rank, backlinks, referring domains, spam score | $0.029 |
| `referring_domains` | The domains linking to a site | $0.024 + small per row |
| `page_audit` | Title, meta, headings, canonical, word count, timing and checks for one URL | $0.0002 |
| `dataforseo_request` | Any other DataForSEO v3 endpoint (Maps, YouTube, Amazon, Trends, WHOIS…) | endpoint price |

## Rules

- Market defaults to the United States in English (`location_code` 2840, `language_code` en). Ask or infer the target market first; common codes: UK 2826, Germany 2276, France 2250, Spain 2724, Italy 2380, Japan 2392, India 2356, Brazil 2076, Canada 2124, Australia 2036.
- Batch: one `keyword_overview` call with many keywords, never one call per keyword.
- Start small (`limit` 20–50, `depth` 10) and widen only when the user needs more.
- Tell the user before a run that will cost more than about $0.50, with the estimate.
- On "Insufficient CallAI balance", stop and give the user the top-up link from the error.
- `dataforseo_request` always needs a `limit` or `filters`; endpoints without them can return and bill thousands of rows.

## Workflows

**Keyword research for a topic**
1. `keyword_ideas` on 1–3 seed terms with `max_difficulty` around 30 for a new site, 50 for an established one.
2. `keyword_overview` on the shortlist to confirm volume, CPC and intent.
3. `google_serp` on the top 3–5 candidates: count weak results (forums, thin pages, small sites) on page one; those are the winnable keywords.
4. Group keywords by intent into pages; one primary keyword per page.

**Competitor analysis**
1. `domain_overview` for the user's domain and each competitor.
2. `keyword_gap` competitor vs. user, sorted by volume; keep keywords with difficulty the user's site can win.
3. `ranked_keywords` on a competitor to see which pages earn its traffic.
4. `backlinks_summary` on both to compare authority before promising rankings.

**GEO / AI search visibility**
1. `google_serp` on the user's money keywords; read the `ai_overview` item and its `references`.
2. List which domains the AI Overview cites, and whether the user's site is among them.
3. For cited competitor pages, `page_audit` them to see the structure (headings, FAQ, length) that earned the citation.

**Page audit**
`page_audit` the URL, then report the failing `checks`, title and description length, missing canonical or H1, and slow timing, each with a concrete fix.

**Backlink check (e.g. before buying an expired domain)**
`backlinks_summary` for authority and spam score, then `referring_domains` sorted by rank; flag spam scores above 30 and link sources from unrelated or gambling/pharma sites.
