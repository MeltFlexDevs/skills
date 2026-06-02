# Install (for agents)

Paste the block below into your AI agent. It will install the MeltFlex skills and verify auth.

---

You are setting up the **MeltFlex** skills for interior-design generation. Do the following:

1. Install the skills into this agent:
   ```bash
   npx skills add MeltFlexDevs/skills
   ```
2. Check that a MeltFlex API key is available:
   ```bash
   echo "${MELTFLEX_API_KEY:-MISSING}"
   ```
   If it prints `MISSING`, ask me for a `mf_sk_...` key (from https://www.meltflexai.com/settings, Growth plan or higher) and have me export it:
   ```bash
   export MELTFLEX_API_KEY="mf_sk_..."
   ```
3. Confirm the skills are available: `/meltflex:design` and `/meltflex:furniture`.
4. When I ask to redesign or stage a space, expect a source photo (file path or URL), pick the right mode, write a specific prompt, call `https://www.meltflexai.com/api/v1/generate`, save the returned image to disk, and tell me the path and credits used.

Do not print or store the API key anywhere except the environment variable.

---

Prefer the MeltFlex MCP server if available (`npx -y meltflex-mcp`) — use its `generate_interior` and `check_credits` tools instead of raw API calls.
