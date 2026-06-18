# MeltFlex AI Skills

[![License: MIT](https://img.shields.io/badge/License-MIT-22c55e.svg)](./LICENSE)
[![Version](https://img.shields.io/badge/version-0.2.0-3b82f6.svg)](./VERSION)
[![Skills](https://img.shields.io/badge/skills-2-8b5cf6.svg)](#skills)
[![Website](https://img.shields.io/badge/meltflexai.com-f97316.svg)](https://www.meltflexai.com)

AI agent skills for **photorealistic interior design** via MeltFlex AI — restyle rooms, place real furniture, virtually stage, and re-theme spaces from a single photo. Works with Claude Code, <img src="assets/hermes.png" width="14" align="center" alt="" /> Hermes, Cursor, Codex, and other AI agents that load Markdown-based skills or speak MCP.

Each user authenticates with their **own** MeltFlex API key; every generation is billed to their account credits. The skills call the public [MeltFlex API](https://www.meltflexai.com/api) directly, so there's nothing extra to install.

<p align="center">
  <img src="https://www.meltflexai.com/api-docs/room-empty.webp" width="32%" alt="Input room" />
  <img src="https://www.meltflexai.com/api-docs/room-result.webp" width="32%" alt="Redesigned room" />
  <img src="https://www.meltflexai.com/api-docs/restyle-japanese.webp" width="32%" alt="Japanese restyle" />
</p>

## Install

Pick one. Each method sets up the skills for your agent.

### `npx skills` — recommended, cross-agent
```bash
npx skills add MeltFlexDevs/skills
```

### GitHub CLI (v2.90+)
```bash
gh skill install MeltFlexDevs/skills
```

### Claude Code marketplace
Inside Claude Code:
```
/plugin marketplace add MeltFlexDevs/skills
/plugin install meltflex@meltflex
```

### Setup script
Universal fallback:
```bash
git clone --depth 1 https://github.com/MeltFlexDevs/skills.git
cd skills
./setup
```

More options in [INSTALL.md](./INSTALL.md). Agent-driven install (paste into your agent): [INSTALL_FOR_AGENTS.md](./INSTALL_FOR_AGENTS.md).

## Authenticate

You need an **active subscription** (any paid plan) — without one the key won't work. After subscribing at <https://www.meltflexai.com/settings>, open **account settings** → **API Key** under Profile, then **Generate API Key** (shown once — copy it):

<p align="center">
  <img src="https://www.meltflexai.com/api-docs/step-profile.webp" width="48%" alt="Settings — click API Key" />
  <img src="https://www.meltflexai.com/api-docs/step-generate.webp" width="48%" alt="Generate API Key" />
</p>

Then expose it:

```bash
export MELTFLEX_API_KEY="mf_sk_xxxxxxxxxxxx"
```

## <img src="assets/hermes.png" width="20" align="center" alt="" /> Use with Hermes

[Hermes](https://hermes-agent.nousresearch.com) (Nous Research) speaks MCP, so it runs MeltFlex through the [`meltflex-mcp`](https://www.meltflexai.com/mcp) server.

**From the catalog** (once merged into the Hermes catalog):
```bash
hermes mcp install meltflex
```

**Manually** — sign in once, then add the server to `~/.hermes/config.yaml`:
```bash
npx -y meltflex-mcp auth login
```
```yaml
mcp_servers:
  meltflex:
    command: npx
    args: ["-y", "meltflex-mcp"]
```
Start `hermes chat` (or run `/reload-mcp` in a session) to load the `generate_interior` and `check_credits` tools. Full guide: <https://www.meltflexai.com/mcp>.

## Skills

| Skill | Invoke | Description |
|-------|--------|-------------|
| meltflex-design | `/meltflex:design` | Restyle, redesign, declutter, virtually stage, or re-theme a room, facade, or garden from a photo. 8 modes (restyle, virtual staging, declutter, exterior, garden, wall texture, floor restyle, seasonal). |
| meltflex-furniture | `/meltflex:furniture` | Place specific real furniture/decor products into a room photo, matching their exact colors, materials, and proportions (up to 10 reference items). |

Both skills are self-contained: a room photo in, a photorealistic redesign out, **10 credits** per generation (auto-refunded on failure).

## Modes

`meltflex-design` — 8 modes, each the same endpoint with a mode-tuned prompt:

| Mode | What it's for |
|------|---------------|
| `restyle` | Change a room's style or theme |
| `virtual_staging` | Furnish an empty room |
| `declutter` | Clean up / depersonalize a space |
| `exterior` | Building facade / house exterior |
| `garden` | Landscaping and outdoor design |
| `wall_texture` | Change wall material or finish |
| `floor_restyle` | Change the flooring |
| `seasonal` | Time-of-day / seasonal / lighting variation |

## Quick Reference

| What you want | Skill | Note |
|---------------|-------|------|
| Restyle a room from a photo | `meltflex-design` | Pick a mode, write a specific prompt |
| Furnish an empty room | `meltflex-design` | `virtual_staging` mode |
| Place a *specific* sofa/bed/table | `meltflex-furniture` | Pass product images as references |
| Redesign a house exterior or garden | `meltflex-design` | `exterior` / `garden` mode |
| Swap flooring or wall finish | `meltflex-design` | `floor_restyle` / `wall_texture` |
| Check credit balance | — | `meltflex credits` (CLI) or the MCP `check_credits` tool |

## Going further

- **API docs:** <https://www.meltflexai.com/api>
- **CLI:** <https://www.meltflexai.com/cli> — `meltflex generate` from your terminal
- **MCP server:** <https://www.meltflexai.com/mcp> — `npx -y meltflex-mcp`
- **Cookbook:** [COOKBOOK.md](./COOKBOOK.md)

## Security

The skills never contain a key. Each user supplies their own `mf_sk_` key via `MELTFLEX_API_KEY`; generations spend that user's own credits. Credits, auth, and rate limits are all enforced server-side. Never commit your key — revoke it anytime in [settings](https://www.meltflexai.com/settings).

## License

MIT — see [LICENSE](./LICENSE). Contributions welcome — see [CONTRIBUTING.md](./CONTRIBUTING.md).
