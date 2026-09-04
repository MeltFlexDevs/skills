#!/usr/bin/env node
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { createServer } from './server.js';
import { MeltflexClient } from './api.js';
import { saveImages, saveBuffer, downloadToFile } from './util.js';
import { saveApiKey, loadConfig, CONFIG_PATH, DEFAULT_BASE_URL } from './config.js';
import { loginViaBrowser } from './auth-login.js';
const USAGE = `MeltFlex AI — generate photorealistic interiors from your terminal or AI agent.

Usage:
  meltflex                          Start the MCP server over stdio (used by AI agents)
  meltflex auth login               Sign in via your browser (recommended)
  meltflex auth <mf_sk_...>          Save an existing MeltFlex API key manually
  meltflex whoami                   Show authentication status
  meltflex credits                  Show your credit balance and costs
  meltflex generate [options]       Generate a redesigned interior (10 credits)
  meltflex video [options]          Animate a still into a walkthrough video (100/150 credits)
  meltflex floorplan [options]      Convert a 2D floorplan into a 3D GLB model (100 credits)
  meltflex furniture [options]      Turn a furniture photo into a 3D GLB model (75 credits)
  meltflex world [options]          Turn a room photo into an explorable 3D world (30/200 credits)

generate options:
  -i, --image <path|url>            Source room photo (file path, http(s) URL, or data URL)  [required]
  -p, --prompt <text>               Redesign instruction                                      [required]
  -r, --ref <path|url>              Reference furniture image (repeatable, up to 10)
  -q, --quality <512|1K|2K>         Output resolution (default: model auto)
  -l, --level <lite|quick|pro>      Design level: lite (−2 cr), quick (default), pro (+5 cr)
  --mask                            Region edit — image must have the area painted SOLID RED
  -n, --count <1-3>                 Generate a batch of N variations (default 1)
  -o, --out <path>                  Where to save the result (default ./meltflex-output/)

video options:
  -i, --image <path|url>            Source still image                                        [required]
  -p, --prompt <text>               Optional camera/mood direction
  -d, --duration <4|8>              Clip length in seconds (default 4)
  -a, --aspect <16:9|9:16>          Aspect ratio (default 16:9)
  -o, --out <path>                  Where to save the .mp4 (default ./meltflex-output/)

floorplan options:
  -i, --image <path|url>            Source 2D floorplan image (JPEG/PNG/WebP)                  [required]
  -o, --out <path>                  Where to save the .glb (default ./meltflex-output/)

furniture options:
  -i, --image <path|url>            Photo of ONE furniture piece, plain background              [required]
  --untextured                      Bare geometry only, no texture pass (same price)
  -o, --out <path>                  Where to save the .glb (default ./meltflex-output/)

world options:
  -i, --image <path|url>            Room photo or render                                         [required]
  -m, --model <draft|hd>            draft (30 credits, ~1 min, default) or hd (200 credits, ~5 min)
  --name <text>                     Optional label for the world
  -o, --out <path>                  Where to save the .spz splat (default ./meltflex-output/)

Get an API key at https://www.meltflexai.com/settings (any active subscription).
Config file: ${CONFIG_PATH}
`;
/** Minimal flag parser supporting repeatable --ref and boolean --mask. */
function parseFlags(argv) {
    const alias = {
        '-i': 'image', '-p': 'prompt', '-r': 'ref', '-o': 'out', '-d': 'duration', '-a': 'aspect',
        '-q': 'quality', '-l': 'level', '-n': 'count', '-m': 'model',
        '--image': 'image', '--prompt': 'prompt', '--ref': 'ref', '--out': 'out',
        '--duration': 'duration', '--aspect': 'aspect',
        '--quality': 'quality', '--level': 'level', '--count': 'count', '--mask': 'mask',
        '--model': 'model', '--name': 'name', '--untextured': 'untextured',
    };
    // Flags that take no value.
    const booleans = new Set(['mask', 'untextured']);
    const out = {};
    for (let i = 0; i < argv.length; i++) {
        const key = alias[argv[i]];
        if (!key)
            continue;
        if (booleans.has(key)) {
            out[key] = true;
            continue;
        }
        const val = argv[++i];
        if (val === undefined)
            continue;
        if (key === 'ref') {
            (out.ref ??= []);
            out.ref.push(val);
        }
        else {
            out[key] = val;
        }
    }
    return out;
}
async function runServer() {
    const server = createServer();
    const transport = new StdioServerTransport();
    await server.connect(transport);
    // stdout is the JSON-RPC channel — only log to stderr.
    console.error('[meltflex] MCP server running on stdio');
}
async function cmdGenerate(argv) {
    const f = parseFlags(argv);
    const image = f.image;
    const prompt = f.prompt;
    if (!image || !prompt) {
        console.error('Error: --image and --prompt are required.\n\n' + USAGE);
        process.exit(1);
    }
    const refs = f.ref ?? [];
    const quality = f.quality;
    if (quality && quality !== '512' && quality !== '1K' && quality !== '2K') {
        console.error('Error: --quality must be 512, 1K, or 2K.');
        process.exit(1);
    }
    const level = f.level;
    if (level && level !== 'lite' && level !== 'quick' && level !== 'pro') {
        console.error('Error: --level must be lite, quick, or pro.');
        process.exit(1);
    }
    let variations;
    if (f.count !== undefined) {
        variations = Math.floor(Number(f.count));
        if (!Number.isFinite(variations) || variations < 1 || variations > 3) {
            console.error('Error: --count must be between 1 and 3.');
            process.exit(1);
        }
    }
    const client = MeltflexClient.fromConfig();
    console.error(variations && variations > 1 ? `Generating ${variations} variations…` : 'Generating…');
    const { images, count, creditsUsed } = await client.generate({
        prompt,
        image,
        referenceImages: refs.length ? refs : undefined,
        resolution: quality,
        designLevel: level,
        mask: f.mask === true,
        variations,
    });
    const targets = saveImages(images, f.out);
    if (count > 1) {
        console.log(`✅ Saved ${count} variations:`);
        for (const t of targets)
            console.log(`  • ${t}`);
    }
    else {
        console.log(`✅ Saved to ${targets[0]}`);
    }
    console.log(`Credits used: ${creditsUsed}`);
}
async function cmdVideo(argv) {
    const f = parseFlags(argv);
    const image = f.image;
    if (!image) {
        console.error('Error: --image is required.\n\n' + USAGE);
        process.exit(1);
    }
    const durationRaw = f.duration;
    const durationSeconds = durationRaw === '8' ? 8 : durationRaw === '4' || durationRaw === undefined ? 4 : undefined;
    if (durationSeconds === undefined) {
        console.error('Error: --duration must be 4 or 8.');
        process.exit(1);
    }
    const aspectRaw = f.aspect;
    if (aspectRaw && aspectRaw !== '16:9' && aspectRaw !== '9:16') {
        console.error('Error: --aspect must be 16:9 or 9:16.');
        process.exit(1);
    }
    const client = MeltflexClient.fromConfig();
    console.error(`Generating a ${durationSeconds}s walkthrough… (this can take 30–120s)`);
    const result = await client.generateVideo({
        image,
        prompt: f.prompt,
        durationSeconds,
        aspectRatio: aspectRaw,
    });
    const target = await downloadToFile(result.videoUrl, f.out, 'walkthrough', 'mp4');
    console.log(`✅ Saved to ${target}`);
    console.log(`Credits used: ${result.creditsUsed}${result.processingTime ? ` • Generated in ${result.processingTime}s` : ''}`);
}
async function cmdFloorplan(argv) {
    const f = parseFlags(argv);
    const image = f.image;
    if (!image) {
        console.error('Error: --image is required.\n\n' + USAGE);
        process.exit(1);
    }
    const client = MeltflexClient.fromConfig();
    console.error('Converting floorplan to a 3D model…');
    const result = await client.floorplanTo3d({ image });
    let target;
    if (result.modelUrl) {
        target = await downloadToFile(result.modelUrl, f.out, 'model', 'glb');
    }
    else if (result.model) {
        target = saveBuffer(Buffer.from(result.model, 'base64'), f.out, 'model', 'glb');
    }
    else {
        throw new Error('No model returned by the API.');
    }
    console.log(`✅ Saved to ${target}`);
    console.log(`Credits used: ${result.creditsUsed}`);
}
async function cmdFurniture(argv) {
    const f = parseFlags(argv);
    const image = f.image;
    if (!image) {
        console.error('Error: --image is required.\n\n' + USAGE);
        process.exit(1);
    }
    const client = MeltflexClient.fromConfig();
    console.error('Building a 3D model from the photo… (this takes about 2–3 minutes)');
    let lastPct = -1;
    const result = await client.furnitureTo3d({ image, textured: f.untextured === true ? false : undefined }, (pct) => { if (pct !== lastPct) {
        lastPct = pct;
        console.error(`  … ${pct}%`);
    } });
    const target = await downloadToFile(result.modelUrl, f.out, 'furniture', 'glb');
    console.log(`✅ Saved to ${target}`);
    console.log(`Hosted URL: ${result.modelUrl}`);
    if (result.formats.usdz)
        console.log(`USDZ (signed, ~72 h): ${result.formats.usdz}`);
    console.log(`Credits used: ${result.creditsUsed}`);
}
async function cmdWorld(argv) {
    const f = parseFlags(argv);
    const image = f.image;
    if (!image) {
        console.error('Error: --image is required.\n\n' + USAGE);
        process.exit(1);
    }
    const modelRaw = f.model ?? 'draft';
    if (modelRaw !== 'draft' && modelRaw !== 'hd') {
        console.error('Error: --model must be draft or hd.');
        process.exit(1);
    }
    const client = MeltflexClient.fromConfig();
    console.error(`Building a ${modelRaw} 3D world… (${modelRaw === 'hd' ? 'about 5 minutes' : 'about a minute'})`);
    const result = await client.generateWorld({ image, model: modelRaw, name: f.name });
    const target = await downloadToFile(result.spzUrl, f.out, 'world', 'spz');
    console.log(`✅ World ready: ${result.worldId}`);
    if (result.viewerUrl)
        console.log(`Open in a browser: ${result.viewerUrl}`);
    console.log(`Splat saved to ${target}`);
    console.log(`Credits used: ${result.creditsUsed}`);
}
async function cmdCredits() {
    const client = MeltflexClient.fromConfig();
    const c = await client.credits();
    console.log(`MeltFlex account${c.email ? ` (${c.email})` : ''}`);
    console.log(`Balance: ${c.balance} credits  (earned ${c.totalEarned}, spent ${c.totalSpent})`);
    if (c.costs) {
        console.log('Cost per operation:');
        for (const [k, v] of Object.entries(c.costs))
            console.log(`  • ${k}: ${v}`);
    }
}
async function main() {
    const [cmd, ...rest] = process.argv.slice(2);
    switch (cmd) {
        case undefined:
        case 'serve':
        case 'mcp':
            return runServer();
        case 'auth': {
            const arg = rest[0]?.trim();
            // Browser-based login (recommended) — no copy-pasting keys.
            if (!arg || arg === 'login') {
                const { baseUrl } = loadConfig();
                const key = await loginViaBrowser(baseUrl || DEFAULT_BASE_URL);
                console.log(`✅ Signed in. API key saved to ${saveApiKey(key)}`);
                return;
            }
            // Manual fallback: `meltflex auth mf_sk_...`
            if (!arg.startsWith('mf_sk_')) {
                console.error('Usage:\n  meltflex auth login        Sign in via your browser (recommended)\n  meltflex auth <mf_sk_...>   Save an existing key manually\n\nGet a key at https://www.meltflexai.com/settings (any active subscription).');
                process.exit(1);
            }
            console.log(`✅ API key saved to ${saveApiKey(arg)}`);
            return;
        }
        case 'whoami': {
            const { apiKey, baseUrl } = loadConfig();
            console.log(apiKey
                ? `Authenticated (key ${apiKey.slice(0, 12)}…) → ${baseUrl}`
                : 'Not authenticated. Run: meltflex auth <mf_sk_...>');
            return;
        }
        case 'credits':
            return cmdCredits();
        case 'generate':
            return cmdGenerate(rest);
        case 'video':
            return cmdVideo(rest);
        case 'floorplan':
        case 'floorplan-to-3d':
            return cmdFloorplan(rest);
        case 'furniture':
        case 'furniture-3d':
            return cmdFurniture(rest);
        case 'world':
        case '3d-world':
            return cmdWorld(rest);
        case 'help':
        case '--help':
        case '-h':
            console.log(USAGE);
            return;
        default:
            console.error(`Unknown command: ${cmd}\n\n${USAGE}`);
            process.exit(1);
    }
}
main().catch((err) => {
    console.error(`[meltflex] ${err?.message ?? err}`);
    process.exit(1);
});
