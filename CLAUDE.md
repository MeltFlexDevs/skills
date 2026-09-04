# MeltFlex skills — notes for Claude Code

This repo is a Claude Code plugin marketplace. Manifest: `.claude-plugin/marketplace.json`.

## Install

```
/plugin marketplace add MeltFlexDevs/skills
/plugin install meltflex@meltflex
```

This registers three skills:
- `/meltflex:design` — restyle / redesign / stage a space from a photo (16 modes, quality levels, region edits, batches) and cinematic video walkthroughs
- `/meltflex:furniture` — place specific furniture products into a room
- `/meltflex:3d` — a furniture photo → GLB model, a 2D floorplan → GLB model or rendered 3D picture, a room photo → explorable 3D world

## Auth

The skills need a MeltFlex API key in `MELTFLEX_API_KEY` (any active subscription — <https://www.meltflexai.com/settings>). If you also use the MeltFlex MCP server (`npx -y meltflex-mcp`, sign in with `npx -y meltflex-mcp auth login`), prefer its tools — `generate_interior`, `generate_video`, `floorplan_to_3d`, `furniture_to_3d`, `generate_world`, `check_credits` — they handle file I/O, polling and authentication for you.

## Behavior expected of the agent

1. A **source photo is required** (file path or URL). MeltFlex restyles an existing photo; it does not generate spaces from scratch. Ask for one if missing.
2. Translate vague requests into **specific** prompts (materials, colors, lighting, mood) and pick the matching mode.
3. Each image costs **10 credits** (lite −2, pro +5, batches per image); video 100/150; floorplan 3D picture 10 / GLB 100; furniture → 3D 75; 3D world 30/200 — all auto-refunded on failure. **Say the price before spending more than 30 credits.** Surface credit/auth errors clearly and point to <https://www.meltflexai.com/settings>.
4. The 3D endpoints can answer **HTTP 202** with a `pollUrl`: poll every 5–10 s, never re-POST the same job.
5. Save results to disk and report the path (or hosted URL, `worldId` / `taskId`); offer to iterate.
6. Never print or commit the API key.

## Related

- API reference: <https://www.meltflexai.com/api>
- CLI: <https://www.meltflexai.com/cli>
- MCP: <https://www.meltflexai.com/mcp>
