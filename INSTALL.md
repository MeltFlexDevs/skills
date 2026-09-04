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

All methods need a MeltFlex API key. You need an **active subscription** (any paid plan) — get one at <https://www.meltflexai.com/settings>. Without an active subscription the key won't work.

### Where to find your API key

1. Open your **account settings** and click **API Key** under Profile:

   ![Settings — click API Key](https://www.meltflexai.com/api-docs/step-profile.webp)

2. Click **Generate API Key**. The key is shown only once — copy it immediately:

   ![Generate API Key](https://www.meltflexai.com/api-docs/step-generate.webp)

3. Export it:

   ```bash
   export MELTFLEX_API_KEY="mf_sk_xxxxxxxxxxxx"
   ```

Or, if you use the MCP server / CLI, sign in from the browser instead of copying a key:

```bash
npx -y meltflex-mcp auth login     # opens meltflexai.com/cli/authorize, stores the key in ~/.meltflex/config.json
```

Generations are billed to your own account credits (10 per image; video 100/150; floorplan 3D picture 10 / GLB 100; furniture → 3D 75; 3D world 30/200 — all auto-refunded on failure).

## Optional: MeltFlex MCP server

For agents that prefer tool calls over scripted API calls, install the MCP server. It exposes six tools — `generate_interior`, `generate_video`, `floorplan_to_3d`, `furniture_to_3d`, `generate_world` and `check_credits` — and handles polling and saving files:

```bash
npx -y meltflex-mcp auth login                 # or: npx -y meltflex-mcp auth mf_sk_xxxxxxxxxxxx
# Claude Code:
claude mcp add meltflex -- npx -y meltflex-mcp
```

Cursor / Codex / Cline / Hermes use the same `command: npx`, `args: ["-y", "meltflex-mcp"]` shape — see [llms-install.md](./llms-install.md) and <https://www.meltflexai.com/mcp>. Claude Desktop users can install the extension bundle from [`mcpb/`](./mcpb).

## Use

```
/meltflex:design       # restyle / redesign / stage a space (16 modes) + video walkthroughs
/meltflex:furniture    # place specific furniture into a room
/meltflex:3d           # furniture → 3D model, floorplan → 3D model / picture, photo → 3D world
```

## Troubleshooting

| Symptom | Cause / fix |
|---------|-------------|
| `401 Unauthorized` | Key missing/wrong/revoked — re-check `MELTFLEX_API_KEY`. |
| `402 Payment Required` | Out of credits — top up at <https://www.meltflexai.com/settings>. |
| `400 Bad Request` with `validValues` | An option value is not one of the allowed ones — use one from the list. |
| `429 Too Many Requests` | Back off and retry (1s, 2s, 4s…). |
| `202 Accepted` | A 3D build is still running — `GET` the `pollUrl` every 5–10 s; do not re-POST. |
| `5xx` / job `FAILED` | Generation failed; credits are refunded automatically. |
| API key page is empty | API keys require an active subscription. |
