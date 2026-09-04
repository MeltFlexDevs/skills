# Changelog

All notable changes to the MeltFlex skills repo. The bundled MCP server (`mcpb/`) tracks the [`meltflex-mcp`](https://www.npmjs.com/package/meltflex-mcp) npm package.

## 0.4.0 — 2026-09-04

### Added
- **New skill `/meltflex:3d`** (`skills/meltflex-3d/SKILL.md`): furniture photo → GLB 3D model (`POST /api/v1/furniture-3d`, 75 credits), 2D floorplan → GLB model or rendered 3D picture (`POST /api/v1/floorplan-to-3d`, `output: "model"` 100 credits / `output: "render"` 10 credits with style, view, furniture, interiorStyle and labels options), and room photo → explorable 3D world (`POST /api/v1/world`, 30 draft / 200 hd, `worldId` + hosted viewer + `.spz` tiers). Documents the HTTP 202 + `pollUrl` flow, the one-time refund on failed jobs, and the free `?worldId=` link refresh, with a Python polling helper.
- **Claude Desktop bundle (`mcpb/`) on meltflex-mcp 0.6.0**: six tools (`furniture_to_3d` and `generate_world` added), browser sign-in (`auth login`) support, and the 0.5.0 `generate_interior` options. `manifest.json` lists all six tools.
- README showcase images for furniture → 3D and photo → 3D world (real API outputs, `assets/`), plus the floorplan → 3D figure.
- Cookbook recipes: region edit, pro-quality batch, floorplan 3D picture, furniture → 3D, walkable 3D world, and a render → video → world pipeline.

### Changed
- `/meltflex:design` now points to `/meltflex:3d` for 3D output and lists all five video/3D endpoints with prices; `/meltflex:furniture` mentions the optional quality/batch fields and the furniture → 3D path.
- Install guides (INSTALL, INSTALL_FOR_AGENTS, llms-install, CLAUDE.md, Hermes section) list six MCP tools and the browser sign-in; troubleshooting covers 400 `validValues` and 202.
- CONTRIBUTING documents the `mcpb/` refresh step.

## 0.3.0 — 2026-07-19
- Floorplan → 3D costs 100 credits (Gemini cutaway + mesh pipeline).
- `generate` gained `resolution`, `designLevel`, `mask` and `variations`; bundled MCP server updated to meltflex-mcp 0.5.0.
- README showcases the expanded suite with real before/after demos.

## 0.2.x — 2026-06/07
- `meltflex-design` covers the full tool suite (15 modes) plus video walkthroughs and floorplan → 3D.
- Claude Desktop `.mcpb` bundle, Hermes catalog entry, Cline install guide.
- Initial `meltflex-design` and `meltflex-furniture` skills.
