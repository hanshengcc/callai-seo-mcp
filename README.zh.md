# dsh-callai-seo

给 [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) 接上实时 SEO 数据。插件连接青柠AI（CallAI）的 SEO MCP 服务器，并附带 `callai-seo` skill，教 Agent 做关键词调研、竞品差距分析、外链检查、AI 概览（GEO）引用检查和页面体检。

[English](./README.md)

## 工具

Agent 会看到 `mcp__callai__<名称>` 形式的工具：

| 工具 | 返回内容 | 约价 |
|---|---|---|
| `google_serp` | Google 实时搜索结果，含 AI 概览正文及其引用网站 | 每 10 条 $0.002 |
| `bing_serp` | Bing 实时搜索结果 | 每 10 条 $0.002 |
| `keyword_overview` | 最多 100 个词的搜索量、CPC、难度、意图 | $0.01 + 每词 $0.0001 |
| `keyword_ideas` | 包含种子词的长尾词，可按难度筛选 | $0.01 + 每行 $0.0001 |
| `ranked_keywords` | 某域名有排名的关键词，按流量排序 | $0.01 + 每行 $0.0001 |
| `domain_overview` | 估算自然流量与排名分布 | $0.01 |
| `keyword_gap` | 竞品有排名而你没有的关键词 | $0.01 + 每行 $0.0001 |
| `backlinks_summary` | 域名评分、外链数、引用域、垃圾分 | $0.02 |
| `referring_domains` | 链接到该站的域名列表 | $0.02 + 少量每行费用 |
| `page_audit` | 单个 URL 的页面 SEO 检查 | $0.0002 |
| `dataforseo_request` | 其他任意 DataForSEO v3 接口 | 按接口价格 |

数据来自 DataForSEO。调用从你的青柠AI 余额扣费（按量计费，$1 起充，无月费），每次结果都会写明本次花费。

## 安装

1. 在 <https://callaiapi.com/portal?tab=keys> 创建 API 密钥，并充值任意金额。
2. 安装到你的 profile，然后重启 dsh：

   ```sh
   dsh plugin --profile web add dsh-callai-seo
   ```

   也可以在插件商店里安装。
3. 填入密钥，任选一种：
   - 设置 → 插件 → CallAI SEO → **apiKey**；或
   - 保存名为 `CALLAI_API_KEY` 的凭据，或写进环境变量 / `~/.dsh/.env`：

     ```sh
     CALLAI_API_KEY=sk-live-...
     ```

然后直接提问，例如：「帮我找英国市场关于升降桌的低难度关键词，并看看前三个词谁在排名。」

## 不用 dsh

同一个 MCP 服务器可用于任何支持 Streamable HTTP 的 MCP 客户端：

- 地址：`https://api.callaiapi.com/mcp`
- 请求头：`Authorization: Bearer <你的青柠AI API 密钥>`

Claude Code：

```sh
claude mcp add --transport http callai-seo https://api.callaiapi.com/mcp --header "Authorization: Bearer sk-live-..."
```

Cursor（`.cursor/mcp.json`）及其他用 JSON 配置的客户端：

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

其他客户端的配置：<https://callaiapi.com/integrations/seo-mcp>

## 许可证

MIT
