# Installing the MeltFlex MCP server (for Cline and other agents)

MeltFlex is a **local (stdio)** MCP server distributed on npm as `meltflex-mcp`. No build or clone is required — it runs via `npx`.

## Prerequisites
- **Node.js 18+** (for `npx`).
- A **MeltFlex API key** (`mf_sk_...`) — requires an active MeltFlex subscription. Get one at <https://www.meltflexai.com/settings>, or let the user sign in from the browser with `npx -y meltflex-mcp auth login` (the key is then stored in `~/.meltflex/config.json` and the `env` block below can be omitted). Ask the user for their key; do not invent one.

## Install (add to the MCP settings)
Add this entry to the Cline MCP settings file (`cline_mcp_settings.json`):

```json
{
  "mcpServers": {
    "meltflex": {
      "command": "npx",
      "args": ["-y", "meltflex-mcp"],
      "env": {
        "MELTFLEX_API_KEY": "USER_PROVIDED_KEY"
      },
      "disabled": false,
      "autoApprove": []
    }
  }
}
```

Replace `USER_PROVIDED_KEY` with the user's `mf_sk_...` key.

## Verify
Once added, the server exposes six tools:
- `meltflex.generate_interior` — restyle/redesign a room photo, saved to disk (10 credits per image; `design_level` lite −2 / pro +5; `resolution` 512/1K/2K; `mask` red-region edit; `variations` 1–3). Prompt-driven, so it also covers floors, walls, exteriors, kitchens and more.
- `meltflex.generate_video` — animate a still into a cinematic walkthrough MP4 (100 credits for 4s, 150 for 8s).
- `meltflex.floorplan_to_3d` — convert a 2D floorplan into a GLB 3D model (100 credits).
- `meltflex.furniture_to_3d` — turn one furniture photo into a textured GLB 3D model, plus USDZ/FBX/OBJ links (75 credits, ~2–3 min).
- `meltflex.generate_world` — turn a room photo or render into an explorable 3D world: `.spz` splat on disk + hosted viewer link (30 credits draft, 200 hd).
- `meltflex.check_credits` — show the account's credit balance and per-operation costs.

To confirm it works, call `check_credits` — it should return the balance for the authenticated account.

## Notes
- The server is a thin client over the public MeltFlex API; credits/auth are enforced server-side. Without an active subscription the key returns 401.
- The 3D tools wait for the build (minutes) and poll the API's HTTP 202 job for you; set a generous tool timeout.
- Docs: <https://www.meltflexai.com/mcp>
