# Changelog

## 0.1.0 — 2026-11-04

First release as `callai` (replaces the unreleased `dsh-callai-seo`).

- DeepSeek Harness plugin that connects the CallAI SEO MCP server (`https://api.callaiapi.com/mcp`) with 11 tools: `google_serp`, `bing_serp`, `keyword_overview`, `keyword_ideas`, `ranked_keywords`, `domain_overview`, `keyword_gap`, `backlinks_summary`, `referring_domains`, `page_audit`, `dataforseo_request`.
- Bundled `callai-seo` skill with workflows for keyword research, competitor gaps, GEO / AI Overview checks, page audits and backlink checks.
- API key from the plugin's `apiKey` setting, the `CALLAI_API_KEY` credential, or the `CALLAI_API_KEY` environment variable; reconnects when the stored credential changes. Works in profiles without a credentials service (such as `headless`).
