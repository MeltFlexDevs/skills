# Install (for agents)

Paste the block below into your AI agent. It will install the MeltFlex skills and verify auth.

---

You are setting up the **MeltFlex** skills for interior-design and 3D generation. Do the following:

1. Install the skills into this agent:
   ```bash
   npx skills add MeltFlexDevs/skills
   ```
2. Check that a MeltFlex API key is available:
   ```bash
   echo "${MELTFLEX_API_KEY:-MISSING}"
   ```
   If it prints `MISSING`, ask me for a `mf_sk_...` key (from https://www.meltflexai.com/settings, any active subscription) and have me export it:
   ```bash
   export MELTFLEX_API_KEY="mf_sk_..."
   ```
3. Confirm the skills are available: `/meltflex:design`, `/meltflex:furniture` and `/meltflex:3d`.
4. When I ask to redesign or stage a space, expect a source photo (file path or URL), pick the right mode, write a specific prompt, call `https://www.meltflexai.com/api/v1/generate`, save the returned image to disk, and tell me the path and credits used.
5. When I ask for 3D — a model of a furniture piece, a 3D model or picture of a floorplan, or a walkable 3D world of a room — use `/meltflex:3d`: tell me the credit cost first, call the matching endpoint (`/api/v1/furniture-3d`, `/api/v1/floorplan-to-3d`, `/api/v1/world`), poll the `pollUrl` if you get HTTP 202, and report the hosted URL, the job/world id and credits used.

Do not print or store the API key anywhere except the environment variable.

---

Prefer the MeltFlex MCP server if available (`npx -y meltflex-mcp`) — use its `generate_interior`, `generate_video`, `floorplan_to_3d`, `furniture_to_3d`, `generate_world` and `check_credits` tools instead of raw API calls; they poll and save files for you.
