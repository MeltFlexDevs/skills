#!/usr/bin/env node
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { createServer } from './server.js';
import { MeltflexClient } from './api.js';
import { saveImage } from './util.js';
import { saveApiKey, loadConfig, CONFIG_PATH } from './config.js';
const USAGE = `MeltFlex AI — generate photorealistic interiors from your terminal or AI agent.

Usage:
  meltflex                          Start the MCP server over stdio (used by AI agents)
  meltflex auth <mf_sk_...>          Save your MeltFlex API key
  meltflex whoami                   Show authentication status
  meltflex credits                  Show your credit balance and costs
  meltflex generate [options]       Generate a redesigned interior

generate options:
  -i, --image <path|url>            Source room photo (file path, http(s) URL, or data URL)  [required]
  -p, --prompt <text>               Redesign instruction                                      [required]
  -r, --ref <path|url>              Reference furniture image (repeatable, up to 10)
  -o, --out <path>                  Where to save the result (default ./meltflex-output/)

Get an API key at https://www.meltflexai.com/settings (any active subscription).
Config file: ${CONFIG_PATH}
`;
/** Minimal flag parser supporting repeatable --ref. */
function parseFlags(argv) {
    const alias = {
        '-i': 'image', '-p': 'prompt', '-r': 'ref', '-o': 'out',
        '--image': 'image', '--prompt': 'prompt', '--ref': 'ref', '--out': 'out',
    };
    const out = {};
    for (let i = 0; i < argv.length; i++) {
        const key = alias[argv[i]];
        if (!key)
            continue;
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
    const client = MeltflexClient.fromConfig();
    console.error('Generating…');
    const { image: dataUrl, creditsUsed } = await client.generate({
        prompt,
        image,
        referenceImages: refs.length ? refs : undefined,
    });
    const target = saveImage(dataUrl, f.out);
    console.log(`✅ Saved to ${target}`);
    console.log(`Credits used: ${creditsUsed}`);
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
            const key = rest[0]?.trim();
            if (!key || !key.startsWith('mf_sk_')) {
                console.error('Usage: meltflex auth <mf_sk_...>\nGet your API key at https://www.meltflexai.com/settings (any active subscription).');
                process.exit(1);
            }
            console.log(`✅ API key saved to ${saveApiKey(key)}`);
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
