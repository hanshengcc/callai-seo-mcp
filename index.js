/**
 * CallAI SEO for DeepSeek Harness: connects the CallAI SEO MCP server and bundles the `callai-seo` skill.
 * @module dsh-callai-seo
 */

import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import z from '@deepseek-ai/schemastery'
import * as McpClient from '@deepseek-ai/dsh-mcp-client'

export const name = 'callai-seo'

/** The MCP client registers its tools in the tool registry. */
export const inject = ['tools']

const SERVER_NAME = 'callai'
const DEFAULT_URL = 'https://api.callaiapi.com/mcp'
/** Credential reference resolved by the profile's credentials provider (stored value, then environment). */
const CREDENTIAL_REF = 'CALLAI_API_KEY'
/** Same rank as other bundled skills, below every project and user skill directory. */
const BUNDLED_SKILL_RANK = 600

const SKILL_URL = new URL('./skills/callai-seo/SKILL.md', import.meta.url)
const SKILL_DIR = { kind: 'directory', path: fileURLToPath(new URL('./skills/callai-seo/', import.meta.url)) }
const SKILL = {
  name: 'callai-seo',
  description:
    'Live SEO data through the CallAI MCP tools (mcp__callai__*): Google/Bing SERP and AI Overview citations, keyword volume and difficulty, long-tail ideas, competitor keyword gaps, domain traffic, backlinks and on-page audits. Use for keyword research, competitor analysis, content planning, backlink checks, GEO/AI search visibility and SEO audits.',
  invocation: { modelInvocable: true, userInvocable: true },
  provider: 'callai-seo',
  source: 'bundled',
  resourceBase: SKILL_DIR,
}

export const Config = z.object({
  apiKey: z.string().role('secret').description('CallAI API key (sk-live-…). Leave empty to read the CALLAI_API_KEY credential or environment variable.'),
  url: z.string().default(DEFAULT_URL).description('MCP endpoint. Change only for a self-hosted gateway.'),
  toolCallTimeoutMs: z.number().min(1000).default(120000).description('Per-call timeout; live SERP and backlink calls can take up to a minute.'),
})

const skillProvider = {
  name: SKILL.provider,
  list: () => Promise.resolve([{ ...SKILL, rank: BUNDLED_SKILL_RANK, locator: SKILL_URL }]),
  async get() {
    return { ...SKILL, content: await readFile(SKILL_URL, 'utf8') }
  },
}

function connectionConfig(config) {
  const apiKey = config.apiKey?.trim()
  return McpClient.Config({
    serverName: SERVER_NAME,
    transport: 'streamable-http',
    url: config.url || DEFAULT_URL,
    headers: { Authorization: `Bearer ${apiKey || `\${credential:${CREDENTIAL_REF}}`}` },
    expandTemplates: !apiKey,
    toolCallTimeoutMs: config.toolCallTimeoutMs,
  })
}

export function apply(ctx, config) {
  ctx.inject(['skills'], (scope) => {
    scope.skills.registerProvider(() => skillProvider)
  })
  const connection = connectionConfig(config)
  if (config.apiKey?.trim()) {
    ctx.plugin(McpClient, connection)
    return
  }
  // The client resolves ${credential:…} through ctx.credentials, which must exist when it starts.
  ctx.inject(['credentials'], (scope) => {
    scope.plugin(McpClient, connection)
  })
}
