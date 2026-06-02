---
name: meltflex-design
description: Generate photorealistic interior (and exterior) design redesigns from a photo using MeltFlex AI. Use when the user wants to restyle, redesign, declutter, virtually stage, or re-theme a room, facade, or garden, or visualize a space in a different style, material, or season. Works directly against the MeltFlex REST API — no extra install required.
---

# MeltFlex — AI Interior Design

MeltFlex turns a real photo of a space into a redesigned, photorealistic result. This skill calls the MeltFlex REST API directly, so it works in any agent without installing anything else. (If the `meltflex-mcp` server is configured, prefer its `generate_interior` tool — it handles file I/O for you.)

To place **specific furniture products** into a room, use the companion skill `/meltflex:furniture`.

## Prerequisites

The user needs a MeltFlex API key (`mf_sk_...`), available on a Growth plan or higher at <https://www.meltflexai.com/settings>. Expect it in the `MELTFLEX_API_KEY` environment variable. If missing, ask them to set it:

```bash
export MELTFLEX_API_KEY="mf_sk_..."
```

Each generation costs **10 credits**, deducted upfront and auto-refunded on failure. Credits belong to the user's account.

## The one endpoint

`POST https://www.meltflexai.com/api/v1/generate`

Headers: `Authorization: Bearer $MELTFLEX_API_KEY`, `Content-Type: application/json`.

Body:
- `prompt` (string, required) — the redesign instruction.
- `imageUrl` (string) **or** `image` (base64 data URL) — the source photo. Prefer `imageUrl`.

Response: `{ "success": true, "image": "data:image/png;base64,...", "creditsUsed": 10 }`.

## Modes

Every mode is the same endpoint with a mode-tuned prompt. Pick the mode that matches the request and lead the prompt with it.

| Mode | What it's for | Prompt lead-in |
|------|---------------|----------------|
| `restyle` | Change a room's style/theme | "Redesign this room in <style>: …" |
| `virtual_staging` | Furnish an empty room | "Furnish this empty room as a <style> <room type>: …" |
| `declutter` | Clean up / depersonalize | "Declutter and tidy this room, keep the layout, neutral staging" |
| `exterior` | Building facade / house exterior | "Redesign this house exterior in <style>, keep structure" |
| `garden` | Landscaping / outdoor | "Redesign this garden: <plants, paving, mood>" |
| `wall_texture` | Change wall material/finish | "Change the walls to <material/color>, keep everything else" |
| `floor_restyle` | Change flooring | "Replace the floor with <material>, keep everything else" |
| `seasonal` | Lighting / season variation | "Show this room at <time of day / season> with <lighting>" |

Always preserve room structure (walls, windows, doors, flooring) **unless** the mode is explicitly about changing it.

## How to run it

Use a small script so you can decode the base64 result to a file (Python example):

```python
import os, base64, requests

resp = requests.post(
    "https://www.meltflexai.com/api/v1/generate",
    headers={"Authorization": f"Bearer {os.environ['MELTFLEX_API_KEY']}"},
    json={
        "imageUrl": "https://your-cdn.com/empty-room.jpg",
        "prompt": "Redesign in warm Scandinavian style: light oak floor, beige linen sofa, soft daylight. Preserve windows and walls.",
    },
    timeout=180,
)
data = resp.json()
if data.get("success"):
    open("redesign.png", "wb").write(base64.b64decode(data["image"].split(",", 1)[1]))
    print("Saved redesign.png")
else:
    print("Error:", data.get("error") or data.get("message"))
```

For a **local** source photo, send it as a data URL in `image` instead of `imageUrl`:

```python
import base64, mimetypes
path = "living-room.jpg"
mime = mimetypes.guess_type(path)[0] or "image/jpeg"
b64 = base64.b64encode(open(path, "rb").read()).decode()
body = {"image": f"data:{mime};base64,{b64}", "prompt": "..."}
```

## How to work with the user

1. **Always need a source photo.** MeltFlex restyles an existing photo — it does not invent spaces from scratch. If the user gives only a description, ask for a file path or URL.
2. **Pick a mode**, then write a **specific** prompt — materials, colors, furniture, lighting, mood. "make it cozy" → "Warm Scandinavian living room: light oak floor, beige linen sofa, cream wool rug, soft diffused daylight."
3. **Report** the saved path and credits used; offer to iterate.
4. **Errors**: 402 = insufficient credits (point to /settings); 401 = bad/missing key; 429 = rate limited (retry with backoff); 5xx = failed, credits auto-refunded.

## Tips

- Prefer `imageUrl` over base64 — avoids the 15 MB body limit and is faster.
- Input images ≥1024px on the long side give the best results.
- Never print or commit the API key.
