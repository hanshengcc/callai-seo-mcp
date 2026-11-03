# CallAI（青柠AI）—— 给 AI Agent 的实时 SEO 数据

[![npm](https://img.shields.io/npm/v/callai?logo=npm&color=cb3837)](https://www.npmjs.com/package/callai)
[![license](https://img.shields.io/npm/l/callai?color=blue)](./LICENSE)

[English](./README.md)

让 Agent 用真实搜索数据说话，而不是凭印象猜：Google / Bing 实时搜索结果（含 Google AI 概览及其引用网站）、关键词搜索量与难度、长尾词挖掘、竞品关键词差距、域名流量、外链和页面 SEO 体检。

两种用法：

- **DeepSeek Harness（dsh）插件**：就是这个 npm 包。装好后 Agent 会获得这些工具，以及一个 `callai-seo` skill，教它怎么做关键词调研、竞品分析、GEO 检查和页面体检。
- **远程 MCP 服务器**：`https://api.callaiapi.com/mcp`，可用于 Claude Code、Cursor、VS Code、Cline、Windsurf 等任何 MCP 客户端，无需安装。

数据来自 [DataForSEO](https://dataforseo.com/)。按次从你的青柠AI 余额扣费：$1 起充，无月费，余额不过期。每次工具结果都会写明本次花费。

---

## 目录

- [1. 获取 API 密钥](#1-获取-api-密钥)
- [2. 在 DeepSeek Harness 中安装](#2-在-deepseek-harness-中安装)
- [3. 在其他 MCP 客户端中使用](#3-在其他-mcp-客户端中使用)
- [4. 可以这样问](#4-可以这样问)
- [5. 工具说明](#5-工具说明)
- [6. 市场：地区与语言代码](#6-市场地区与语言代码)
- [7. 价格与花费控制](#7-价格与花费控制)
- [8. 常见问题排查](#8-常见问题排查)
- [9. FAQ](#9-faq)

---

## 1. 获取 API 密钥

1. 在 <https://callaiapi.com/register> 注册。
2. 充值任意金额（$1 起）：支持银行卡、Apple Pay / Google Pay，以及多条公链的 USDT。
3. 在 **API 密钥管理** 创建密钥：<https://callaiapi.com/portal?tab=keys>，格式为 `sk-live-…`。每个密钥都可以单独设置消费上限。

## 2. 在 DeepSeek Harness 中安装

需要 dsh 0.2.0 或更高版本。

```sh
dsh plugin --profile web add callai
```

如果你用的不是 `web` profile，换成自己的名字（`ls ~/.dsh/profiles` 可以查看）。也可以在 dsh-plugin-shop 等插件商店里搜索 **callai** 安装。装完要重启 dsh，正在运行的进程不会加载新插件。

### 填入密钥

插件按下面的顺序找密钥，用找到的第一个：

| 位置 | 怎么设置 |
|---|---|
| 插件配置 `apiKey` | 写在 profile 的 `cordis.patch.yml` 里（见下），或者在 dsh 的插件设置页填写（如果你的 dsh 版本有这个页面） |
| dsh 凭据 `CALLAI_API_KEY` | 在 dsh 的凭据设置里保存，或写进 `~/.dsh/.credentials.yaml` 的 `refs`，或写进 `~/.dsh/.env`（适用于启用了凭据服务的 profile，比如 `web`） |
| 环境变量 `CALLAI_API_KEY` | `CALLAI_API_KEY=sk-live-… dsh web`，所有 profile 都可用，包括 `headless` |

profile 补丁文件 `~/.dsh/profiles/<profile>/cordis.patch.yml`：

```yaml
- id: callai-seo
  config:
    apiKey: sk-live-你的密钥
```

`.env` 文件 `~/.dsh/.env`：

```sh
CALLAI_API_KEY=sk-live-你的密钥
```

通过 dsh 保存凭据后会自动重连；改补丁文件、`.env` 或环境变量，需要重启 dsh 才生效。

### 确认装好了

开一个会话问「你有哪些 mcp__callai 开头的工具？」，应该列出 11 个；再问「帮我体检 https://example.com」，应该返回真实数据和一行 `billed_usd`。

### 插件配置项

| 配置 | 默认值 | 含义 |
|---|---|---|
| `apiKey` | 空 | 你的青柠AI 密钥。留空则使用 `CALLAI_API_KEY` 凭据或环境变量 |
| `url` | `https://api.callaiapi.com/mcp` | MCP 地址，没有特别说明不要改 |
| `toolCallTimeoutMs` | `120000` | 单次调用超时；深度 SERP 和外链查询可能要一分钟 |

### 卸载

```sh
dsh plugin --profile web remove callai
```

## 3. 在其他 MCP 客户端中使用

| 配置 | 值 |
|---|---|
| 传输方式 | Streamable HTTP |
| 地址 | `https://api.callaiapi.com/mcp` |
| 请求头 | `Authorization: Bearer sk-live-你的密钥` |

**Claude Code**

```sh
claude mcp add --transport http callai https://api.callaiapi.com/mcp \
  --header "Authorization: Bearer sk-live-你的密钥"
```

**Cursor**：项目里的 `.cursor/mcp.json`，或全局 `~/.cursor/mcp.json`：

```json
{
  "mcpServers": {
    "callai": {
      "url": "https://api.callaiapi.com/mcp",
      "headers": { "Authorization": "Bearer sk-live-你的密钥" }
    }
  }
}
```

**VS Code（Copilot Agent 模式）**：`.vscode/mcp.json`：

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

**Windsurf、Cline 及其他客户端**：添加一个远程 / Streamable HTTP 服务器，填上面的地址和请求头即可。只支持本地（stdio）服务器的客户端，可以用 `mcp-remote` 转接：

```json
{
  "mcpServers": {
    "callai": {
      "command": "npx",
      "args": ["-y", "mcp-remote", "https://api.callaiapi.com/mcp", "--header", "Authorization:${AUTH_HEADER}"],
      "env": { "AUTH_HEADER": "Bearer sk-live-你的密钥" }
    }
  }
}
```

## 4. 可以这样问

不用自己调工具，把要做的事说清楚，Agent 会自己选工具。例如：

- 「找英国市场关于升降桌、难度 30 以下的长尾词，再看前三个词谁在排名。」
- 「对比我的网站 example.com 和竞品 competitor.com：流量、他们有排名而我没有的词、外链强弱。」
- 「Google 搜 best crm for startups 有没有 AI 概览？引用了哪些网站，有没有我的？」
- 「体检 https://example.com/pricing，给我一份修改清单。」
- 「我准备买过期域名 old-brand.com，帮我查外链和垃圾分。」
- 「查这 40 个词在德国、德语下的搜索量和 CPC：……」

## 5. 工具说明

在 dsh 里工具名是 `mcp__callai__<名称>`，其他客户端显示 `<名称>`。每个结果都是 JSON，包含 `billed_usd`（本次花费）和 `result`。带 * 的参数必填。除外链和页面体检工具外，其余工具都接受 `location_code` 和 `language_code`（见[第 6 节](#6-市场地区与语言代码)）。

| 工具 | 参数 | 返回 |
|---|---|---|
| `google_serp` | `keyword`*、`depth` 10–100（默认 10）、`device` desktop/mobile | 排名结果（标题、网址、域名、摘要）；Google 显示 AI 概览时，附上概览正文和引用来源 |
| `bing_serp` | 同 `google_serp` | Bing 排名结果 |
| `keyword_overview` | `keywords`*（最多 100 个） | 每个词的搜索量、CPC、竞争度、难度 0–100、主要意图 |
| `keyword_ideas` | `keyword`*、`limit` 1–200（默认 50）、`max_difficulty` 0–100 | 包含种子词的长尾词，按搜索量排序，指标同上 |
| `ranked_keywords` | `target`* 域名、`limit` 1–200（默认 50） | 该域名有排名的词，按估算流量排序：排名、排名网址、指标 |
| `domain_overview` | `target`* 域名 | 估算自然流量、排名词数量、排名分布、付费搜索汇总 |
| `keyword_gap` | `competitor`*、`your_domain`*、`limit` 1–200（默认 50） | 竞品有排名而你没有的词，按搜索量排序，附竞品排名和网址 |
| `backlinks_summary` | `target`* 域名 | 域名评分 0–1000、外链数、引用域、nofollow 数、失效外链、垃圾分、首次发现时间 |
| `referring_domains` | `target`* 域名、`limit` 1–200（默认 50） | 链接到该站的域名，强的在前：评分、外链数、垃圾分、首次发现时间 |
| `page_audit` | `url`* | 状态码、标题、描述、canonical、各级标题、字数、链接与图片数、加载时间、页面得分、全部检查项 |
| `dataforseo_request` | `path`*、`method` POST/GET、`body` | 其他任意 [DataForSEO v3 接口](https://docs.dataforseo.com/v3/)：Google 地图、YouTube、亚马逊关键词、Google Trends、大模型提及、WHOIS、网站技术栈、异步 `task_post`/`task_get` 等 |

域名可以写成 `example.com`、`www.example.com` 或完整网址。

## 6. 市场：地区与语言代码

默认市场是美国（`location_code` 2840）、英语（`language_code` en）。直接告诉 Agent「德国市场、德语」即可，它会自己填代码。

| 市场 | `location_code` | 常用 `language_code` |
|---|---|---|
| 美国 | 2840 | en |
| 英国 | 2826 | en |
| 加拿大 | 2124 | en / fr |
| 澳大利亚 | 2036 | en |
| 德国 | 2276 | de |
| 法国 | 2250 | fr |
| 西班牙 | 2724 | es |
| 意大利 | 2380 | it |
| 巴西 | 2076 | pt |
| 日本 | 2392 | ja |
| 印度 | 2356 | en / hi |

完整列表见 [DataForSEO 地区代码](https://docs.dataforseo.com/v3/serp/google/locations/)。

## 7. 价格与花费控制

按 DataForSEO 成本加青柠AI 服务费计费，准确金额以每次结果里的 `billed_usd` 和控制台调用记录为准。常见花费：

| 调用 | 约价 |
|---|---|
| `google_serp` / `bing_serp`，10 条结果 | $0.0024 |
| `keyword_overview`，10 个词 | $0.013 |
| `keyword_ideas` / `ranked_keywords` / `keyword_gap`，50 行 | $0.018 |
| `domain_overview` | $0.015 |
| `backlinks_summary` | $0.029 |
| `referring_domains`，50 行 | 约 $0.03 |
| `page_audit` | $0.0002 |

一次完整的关键词调研（挖词 → 查指标 → 看 5 个词的 SERP）通常远低于 $0.10。

让花费可控：

- 在控制台给密钥设**消费上限**，到了就停。
- 附带的 skill 会让 Agent 批量查词、先用小的 limit，预计超过约 $0.50 的操作先告诉你。
- 余额用完时工具会返回「Insufficient CallAI balance」和充值链接，被拒的调用不扣费。

## 8. 常见问题排查

| 问题 | 解决 |
|---|---|
| dsh 里没有 `mcp__callai__` 工具 | 装完要重启 dsh；检查密钥是否设置（见[第 2 节](#填入密钥)）。没有密钥时插件会打印 `[callai-seo] No API key`，不添加工具 |
| `401` / 「Invalid or inactive API key」 | 用完整密钥（含 `sk-live-`），并确认它在控制台是启用状态 |
| `429`「spend limit reached」 | 提高该密钥的消费上限，或换一个密钥 |
| 「Insufficient CallAI balance」 | 到 <https://callaiapi.com/portal?tab=topup> 充值 |
| `Task failed (40501): Invalid Field …` | 参数不对（比如该市场不支持这种语言），让 Agent 改正参数后重试 |
| 调用超时 | 调小 `depth` 或 `limit`，或调大 `toolCallTimeoutMs` |
| dsh 提示插件不兼容 | 升级 dsh：`npm i -g @deepseek-ai/dsh` |

## 9. FAQ

**有免费额度吗？** 没有。新账户余额为 $0，$1 起充，无订阅、无最低月消费。

**数据从哪来？** DataForSEO 的实时 SERP、Labs、Backlinks 和 On-Page 接口。SERP 在调用时实时抓取；关键词指标和外链来自 DataForSEO 最新的数据库。

**你们存什么？** 为了计费和给你看调用记录，会保存每次调用的接口、状态、花费和耗时。关键词和域名会发给 DataForSEO 以完成查询。

**不用 Agent 能直接调吗？** 可以。同样的数据也提供 REST 接口：`https://api.callaiapi.com/dataforseo/v3/...`，请求格式与 DataForSEO 一致，见 <https://callaiapi.com/dataforseo>。

**我已经有 DataForSEO 账号了。** 那可以直接用 DataForSEO。青柠AI 适合想要 $1 起按量付费、不用预存大额、和大模型 API 共用一个余额，并且需要开箱即用 MCP 的用户。

## 链接

- 接入教程：<https://callaiapi.com/integrations/seo-mcp>
- 控制台：<https://callaiapi.com/portal>
- 问题反馈：<https://github.com/hanshengcc/callai-seo-mcp/issues>

## 许可证

MIT
