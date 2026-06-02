# Installing MeltFlex Skills

Four ways to install — pick whichever fits your setup.

## 1. `npx skills` (recommended, cross-agent)
```bash
npx skills add MeltFlexDevs/skills
```

## 2. GitHub CLI (v2.90+)
```bash
gh skill install MeltFlexDevs/skills
```

## 3. Claude Code marketplace
```
/plugin marketplace add MeltFlexDevs/skills
/plugin install meltflex@meltflex
```

## 4. Setup script (universal fallback)
```bash
git clone --depth 1 https://github.com/MeltFlexDevs/skills.git
cd skills
./setup
```

## Authenticate

All methods need a MeltFlex API key in your environment:

```bash
export MELTFLEX_API_KEY="mf_sk_xxxxxxxxxxxx"
```

Get a key at <https://www.meltflexai.com/settings> (any active subscription). Generations are billed to your own account credits (10 per image, auto-refunded on failure).

## Optional: MeltFlex MCP server

For agents that prefer tool calls over scripted API calls, install the MCP server, which exposes `generate_interior` and `check_credits`:

```bash
npx -y meltflex-mcp auth mf_sk_xxxxxxxxxxxx
# Claude Code:
claude mcp add meltflex -- npx -y meltflex-mcp
```

See <https://www.meltflexai.com/mcp>.

## Use

```
/meltflex:design       # restyle / redesign / stage a space
/meltflex:furniture    # place specific furniture into a room
```

## Troubleshooting

| Symptom | Cause / fix |
|---------|-------------|
| `401 Unauthorized` | Key missing/wrong/revoked — re-check `MELTFLEX_API_KEY`. |
| `402 Payment Required` | Out of credits — top up at <https://www.meltflexai.com/settings>. |
| `429 Too Many Requests` | Back off and retry (1s, 2s, 4s…). |
| `5xx` | Generation failed; credits are refunded automatically. |
| API key page is empty | API keys require an active subscription. |
