# MeltFlex Skills — Cookbook

Practical recipes. All assume `MELTFLEX_API_KEY` is set. Image generations cost 10 credits each (lite −2, pro +5, batches charged per image); video costs 100 (4s) or 150 (8s); floorplan→3D costs 10 (rendered picture) or 100 (GLB model); furniture→3D costs 75; a 3D world costs 30 (draft) or 200 (hd). Credits are auto-refunded on failure.

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

## Change just one corner (region edit)

> "Only the reading nook — put a green velvet armchair there, leave the rest."

Paint the nook **solid red** in the source image first, then `/meltflex:design`, `region_edit` mode:
```
prompt: "Put a green velvet armchair with a brass floor lamp in the red area; keep everything else."
image: ./room-red-marked.png
mask: true
```

## Three options to choose from, sharpest quality

`/meltflex:design`, any mode — 3 × (10 + 5) = 45 credits:
```
prompt: "Japandi bedroom: low oak bed, linen bedding, paper lantern, warm dusk light."
imageUrl: https://cdn.me/bedroom.jpg
resolution: "2K"
designLevel: "pro"
variations: 3
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

`POST /api/v1/video` — 100 credits (4s) or 150 (8s), ~30–120 s:
```
imageUrl: https://cdn.me/render.jpg
durationSeconds: 4          # or 8
aspectRatio: "16:9"         # or "9:16"
prompt: "Slow dolly forward, then pan to the window"   # optional
```
Returns `{ videoUrl }` (a hosted MP4). Via the MCP server it's the `generate_video` tool; via the CLI, `meltflex video`.

## Preview a floorplan as a 3D picture (cheap first look)

> "Show me what this plan looks like in 3D before we build a model."

`/meltflex:3d` — `POST /api/v1/floorplan-to-3d`, 10 credits, ~20 s:
```
imageUrl: https://cdn.me/floorplan.png
output: "render"
style: "photorealistic"      # 3d-model | drawing | sketch | wireframe | clay
view: "isometric"            # or topdown
furniture: "styled"          # furnished | empty | styled
interiorStyle: "scandinavian"
labels: "names"              # full | names | none
```
Returns `{ imageUrl }` (a PNG). REST only — not an MCP tool.

## Convert a 2D floorplan to a 3D model

> "Turn this floorplan into a downloadable 3D model."

`/meltflex:3d` — `POST /api/v1/floorplan-to-3d`, 100 credits, ~3 min:
```
imageUrl: https://cdn.me/floorplan.png
output: "model"              # default
textured: true               # false = bare walls, faster and smaller
```
Returns `{ modelUrl }` (a GLB, ready for three.js / Blender / Unity). MCP tool `floorplan_to_3d`; CLI `meltflex floorplan`.

## Turn a furniture photo into a 3D model

> "I need a GLB of this armchair for my configurator."

`/meltflex:3d` — `POST /api/v1/furniture-3d`, 75 credits, 2–3 min (poll on HTTP 202):
```
imageUrl: https://cdn.me/armchair.jpg     # one piece, plain background, nothing cropped
textured: true                            # false = geometry only, same price
```
Returns `{ modelUrl, thumbnailUrl, formats: { glb, usdz, fbx, obj } }` — `modelUrl` is permanent, the `formats` links are signed and last ~72 h. MCP tool `furniture_to_3d`; CLI `meltflex furniture -i ./armchair.jpg -o ./armchair.glb`.

## Walk through a room in 3D

> "Make this render explorable — I want to look around the room."

`/meltflex:3d` — `POST /api/v1/world`, 30 credits (`draft`, ~1 min) or 200 (`hd`, ~5 min, poll on HTTP 202):
```
imageUrl: https://cdn.me/living-room-render.jpg   # a /meltflex:design result works great
model: "draft"                                     # or hd
name: "Living room v2"
```
Returns `{ worldId, viewerUrl, spzUrl, spzUrls, thumbnailUrl }`. Hand the user `viewerUrl`; store `worldId` — the splat links expire after a few days and `GET /api/v1/world?worldId=...` refreshes them for free. MCP tool `generate_world`; CLI `meltflex world -i ./render.jpg -m draft -o ./world.spz`.

## Render → video → world (the full pipeline)

1. `/meltflex:design` restyles the room at `resolution: "2K"` (10–15 credits).
2. `POST /api/v1/video` animates the render into a 4 s clip (100 credits).
3. `POST /api/v1/world` turns the same render into a walkable world (30 credits).

## Batch tips

- Check the balance first: `meltflex credits` (CLI) or the MCP `check_credits` tool.
- Prefer `imageUrl` over base64 to stay under the 15 MB body limit and run faster.
- The 3D endpoints may answer HTTP 202 with a `pollUrl`: poll every 5–10 s, never re-POST (that charges again).
- On HTTP 429, back off (1s, 2s, 4s…). On 5xx or a FAILED job, credits are refunded automatically.
