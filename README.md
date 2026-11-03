# dsh-callai-seo

Live SEO data for [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness). This plugin connects the CallAI SEO MCP server and adds a `callai-seo` skill that teaches the agent keyword research, competitor gap analysis, backlink checks, AI Overview (GEO) citation checks and page audits.

[中文说明](./README.zh.md)

## Tools

The agent gets these tools as `mcp__callai__<name>`:

| Tool | What it returns | Approx. cost |
|---|---|---|
| `google_serp` | Live Google results plus the AI Overview text and the sites it cites | $0.002 per 10 results |
| `bing_serp` | Live Bing results | $0.002 per 10 results |
| `keyword_overview` | Volume, CPC, difficulty, intent for up to 100 keywords | $0.01 + $0.0001/keyword |
| `keyword_ideas` | Long-tail keywords containing a seed, filterable by difficulty | $0.01 + $0.0001/row |
| `ranked_keywords` | Keywords a domain ranks for, by traffic | $0.01 + $0.0001/row |
| `domain_overview` | Estimated organic traffic and position spread | $0.01 |
| `keyword_gap` | Keywords a competitor ranks for and you don't | $0.01 + $0.0001/row |
| `backlinks_summary` | Domain rank, backlinks, referring domains, spam score | $0.02 |
| `referring_domains` | Domains linking to a site | $0.02 + small per row |
| `page_audit` | On-page SEO checks for one URL | $0.0002 |
| `dataforseo_request` | Any other DataForSEO v3 endpoint | endpoint price |

Data comes from DataForSEO. Calls are billed to your CallAI balance (pay as you go, from $1, no subscription); every result reports what it cost.

## Install

1. Create an API key at <https://callaiapi.com/portal?tab=keys> and top up any amount.
2. Install the plugin into your profile and restart dsh:

   ```sh
   dsh plugin --profile web add dsh-callai-seo
   ```

   Or install it from the plugin shop.
3. Give it the key, either way:
   - Settings → Plugins → CallAI SEO → **apiKey**, or
   - save a credential named `CALLAI_API_KEY`, or set it in the environment / `~/.dsh/.env`:

     ```sh
     CALLAI_API_KEY=sk-live-...
     ```

Then ask, for example: *"Find low-difficulty keywords about standing desks for the UK market and check who ranks for the top three."*

## Without dsh

The same MCP server works in any MCP client over Streamable HTTP:

- URL: `https://api.callaiapi.com/mcp`
- Header: `Authorization: Bearer <your CallAI API key>`

Claude Code:

```sh
claude mcp add --transport http callai-seo https://api.callaiapi.com/mcp --header "Authorization: Bearer sk-live-..."
```

Cursor (`.cursor/mcp.json`) and other JSON-configured clients:

```json
{
  "mcpServers": {
    "callai-seo": {
      "url": "https://api.callaiapi.com/mcp",
      "headers": { "Authorization": "Bearer sk-live-..." }
    }
  }
}
```

Setup for other clients: <https://callaiapi.com/en/integrations/seo-mcp>

## License

MIT
