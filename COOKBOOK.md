# MeltFlex Skills — Cookbook

Practical recipes. All assume `MELTFLEX_API_KEY` is set. Image generations cost 10 credits each; video costs 100 (4s) or 150 (8s); floorplan→3D costs 10. Credits are auto-refunded on failure.

## Restyle a room

> "Here's my living room ./living.jpg — make it warm Scandinavian."

`/meltflex:design`, `restyle` mode:
```
prompt: "Redesign this living room in warm Scandinavian style: light oak floor,
beige linen sofa, cream wool rug, soft diffused daylight. Preserve windows and walls."
image: ./living.jpg
```

## Virtually stage an empty room

> "Stage this empty bedroom https://cdn.me/empty-bed.jpg as modern minimalist."

`/meltflex:design`, `virtual_staging` mode:
```
prompt: "Furnish this empty room as a modern minimalist bedroom: low platform bed,
warm wood nightstands, soft ambient lighting. Keep the windows and flooring."
imageUrl: https://cdn.me/empty-bed.jpg
```

## Place a specific sofa + table

> "Put this exact sofa and coffee table into my room."

`/meltflex:furniture`:
```
prompt: "Place these items naturally — sofa against the back wall, coffee table centered."
imageUrl: https://cdn.me/room.jpg
referenceImageUrls: [ "https://cdn.me/sofa.jpg", "https://cdn.me/table.jpg" ]
referenceProducts: [ {"name":"Modular Sofa"}, {"name":"Oak Coffee Table"} ]
```

## Declutter for a listing photo

`/meltflex:design`, `declutter` mode:
```
prompt: "Declutter and tidy this room, remove personal items, keep the layout
and furniture, neutral real-estate staging, bright even lighting."
imageUrl: https://cdn.me/messy.jpg
```

## Swap the flooring only

`/meltflex:design`, `floor_restyle` mode:
```
prompt: "Replace the floor with wide light-oak planks. Keep everything else exactly the same."
imageUrl: https://cdn.me/room.jpg
```

## Redesign a house exterior

`/meltflex:design`, `exterior` mode:
```
prompt: "Redesign this house exterior in modern style: white render, dark window
frames, wood accents. Keep the building structure and rooflines."
imageUrl: https://cdn.me/facade.jpg
```

## Make a walkthrough video

> "Turn this render into a short cinematic walkthrough clip."

`POST /api/v1/video` — 100 credits (4s) or 150 (8s), asynchronous (~30–120s):
```
imageUrl: https://cdn.me/render.jpg
durationSeconds: 4          # or 8
aspectRatio: "16:9"         # or "9:16"
prompt: "Slow dolly forward, then pan to the window"   # optional
```
Returns `{ videoUrl }` (an MP4). Via the MCP server it's the `generate_video` tool; via the CLI, `meltflex video`.

## Convert a 2D floorplan to a 3D model

> "Turn this floorplan into a downloadable 3D model."

`POST /api/v1/floorplan-to-3d` — 10 credits:
```
imageUrl: https://cdn.me/floorplan.png
```
Returns `{ modelUrl }` (a GLB, ready for three.js / Blender / Unity). MCP tool `floorplan_to_3d`; CLI `meltflex floorplan`.

## Batch tips

- Check the balance first: `meltflex credits` (CLI) or the MCP `check_credits` tool.
- Prefer `imageUrl` over base64 to stay under the 15 MB body limit and run faster.
- On HTTP 429, back off (1s, 2s, 4s…). On 5xx, credits are refunded automatically.
