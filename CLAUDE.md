# MeltFlex skills — notes for Claude Code

This repo is a Claude Code plugin marketplace. Manifest: `.claude-plugin/marketplace.json`.

## Install

```
/plugin marketplace add MeltFlexDevs/skills
/plugin install meltflex@meltflex
```

This registers two skills:
- `/meltflex:design` — restyle / redesign / stage a space from a photo (8 modes)
- `/meltflex:furniture` — place specific furniture products into a room

## Auth

The skills need a MeltFlex API key in `MELTFLEX_API_KEY` (Growth plan or higher — <https://www.meltflexai.com/settings>). If you also use the MeltFlex MCP server (`npx -y meltflex-mcp`), prefer its `generate_interior` and `check_credits` tools — they handle file I/O and authentication for you.

## Behavior expected of the agent

1. A **source photo is required** (file path or URL). MeltFlex restyles an existing photo; it does not generate spaces from scratch. Ask for one if missing.
2. Translate vague requests into **specific** prompts (materials, colors, lighting, mood) and pick the matching mode.
3. Each generation costs **10 credits**, auto-refunded on failure. Surface credit/auth errors clearly and point to <https://www.meltflexai.com/settings>.
4. Save results to disk and report the path; offer to iterate.
5. Never print or commit the API key.

## Related

- API reference: <https://www.meltflexai.com/api>
- CLI: <https://www.meltflexai.com/cli>
- MCP: <https://www.meltflexai.com/mcp>
