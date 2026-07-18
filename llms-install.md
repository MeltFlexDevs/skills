# Installing the MeltFlex MCP server (for Cline and other agents)

MeltFlex is a **local (stdio)** MCP server distributed on npm as `meltflex-mcp`. No build or clone is required — it runs via `npx`.

## Prerequisites
- **Node.js 18+** (for `npx`).
- A **MeltFlex API key** (`mf_sk_...`) — requires an active MeltFlex subscription. Get one at <https://www.meltflexai.com/settings>. Ask the user for their key; do not invent one.

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
Once added, the server exposes four tools:
- `meltflex.generate_interior` — restyle/redesign a room photo, saved to disk (10 credits). Prompt-driven, so it also covers floors, walls, exteriors, kitchens and more.
- `meltflex.generate_video` — animate a still into a cinematic walkthrough MP4 (100/150 credits).
- `meltflex.floorplan_to_3d` — convert a 2D floorplan into a GLB 3D model (10 credits).
- `meltflex.check_credits` — show the account's credit balance.

To confirm it works, call `check_credits` — it should return the balance for the authenticated account.

## Notes
- The server is a thin client over the public MeltFlex API; credits/auth are enforced server-side. Without an active subscription the key returns 401.
- Docs: <https://www.meltflexai.com/mcp>
