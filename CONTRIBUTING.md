# Contributing

Thanks for helping improve the MeltFlex skills.

## Layout

```
.claude-plugin/
  marketplace.json   # plugin + skills manifest (keep in sync with skills/)
  plugin.json        # plugin metadata
skills/
  meltflex-design/SKILL.md
  meltflex-furniture/SKILL.md
README.md  COOKBOOK.md  CLAUDE.md  INSTALL.md  INSTALL_FOR_AGENTS.md  setup  VERSION
```

## Adding or editing a skill

1. Each skill is a folder under `skills/` with a `SKILL.md`.
2. `SKILL.md` starts with YAML frontmatter — `name` and a precise, trigger-rich `description` (this is what agents match on).
3. Keep skills **self-contained** and accurate to the public API (`https://www.meltflexai.com/api/v1/generate`). Don't document capabilities the public API doesn't expose.
4. Register the skill in `.claude-plugin/marketplace.json` (`skills[]` with `name`, `path`, `invoke`).
5. Bump `version` in `marketplace.json`, `plugin.json`, and `VERSION`.

## Principles

- **Never** include real API keys, tokens, or internal hosts — placeholders only (`mf_sk_xxxx`).
- Credits/auth/rate limits are enforced server-side; skills are thin clients.
- Prefer `imageUrl` over base64 in examples.

## Testing

```bash
# validate the manifests
node -e "JSON.parse(require('fs').readFileSync('.claude-plugin/marketplace.json','utf8'))"
node -e "JSON.parse(require('fs').readFileSync('.claude-plugin/plugin.json','utf8'))"

# try the skill locally in an agent
npx skills add ./
```

## PRs

Keep changes focused, update the README tables when you add a skill/mode, and describe what you tested.
