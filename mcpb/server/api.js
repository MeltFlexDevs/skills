import { readFileSync } from 'node:fs';
import { loadConfig } from './config.js';
const EXT_MIME = {
    png: 'image/png',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    webp: 'image/webp',
    gif: 'image/gif',
};
/**
 * Normalize any supported image input into a `data:image/...;base64,...` URL.
 * Accepts: an existing data URL, an http(s) URL (fetched), or a local file path.
 * Converting everything to a data URL guarantees every reference image is honored
 * by the backend (which otherwise prefers URLs over base64 and won't mix them).
 */
async function resolveToDataUrl(input) {
    if (/^data:image\//i.test(input))
        return input;
    if (/^https?:\/\//i.test(input)) {
        const r = await fetch(input);
        if (!r.ok)
            throw new Error(`Failed to fetch image ${input} (HTTP ${r.status})`);
        const buf = Buffer.from(await r.arrayBuffer());
        const mime = r.headers.get('content-type')?.split(';')[0] || 'image/jpeg';
        return `data:${mime};base64,${buf.toString('base64')}`;
    }
    // Treat as a local file path.
    const ext = input.split('.').pop()?.toLowerCase() ?? 'png';
    const mime = EXT_MIME[ext] ?? 'image/png';
    const buf = readFileSync(input); // throws a clear ENOENT if the path is wrong
    return `data:${mime};base64,${buf.toString('base64')}`;
}
export class MeltflexClient {
    apiKey;
    baseUrl;
    constructor(apiKey, baseUrl) {
        this.apiKey = apiKey;
        this.baseUrl = baseUrl;
    }
    static fromConfig() {
        const { apiKey, baseUrl } = loadConfig();
        if (!apiKey) {
            throw new Error('No MeltFlex API key configured. Run `meltflex auth <mf_sk_...>` or set the MELTFLEX_API_KEY environment variable. Get a key at https://www.meltflexai.com/settings (any active subscription).');
        }
        return new MeltflexClient(apiKey, baseUrl);
    }
    headers() {
        return {
            Authorization: `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
        };
    }
    async generate(params) {
        const body = { prompt: params.prompt };
        body.image = await resolveToDataUrl(params.image);
        if (params.referenceImages?.length) {
            body.referenceImages = await Promise.all(params.referenceImages.map(resolveToDataUrl));
        }
        if (params.referenceProducts?.length) {
            body.referenceProducts = params.referenceProducts;
        }
        const res = await fetch(`${this.baseUrl}/api/v1/generate`, {
            method: 'POST',
            headers: this.headers(),
            body: JSON.stringify(body),
        });
        const json = (await res.json().catch(() => ({})));
        if (!res.ok || !json?.success) {
            throw new Error(json?.message || json?.error || `Generation failed (HTTP ${res.status})`);
        }
        return { image: json.image, creditsUsed: json.creditsUsed };
    }
    async credits() {
        const res = await fetch(`${this.baseUrl}/api/v1/credits`, {
            headers: this.headers(),
        });
        const json = (await res.json().catch(() => ({})));
        if (!res.ok) {
            throw new Error(json?.error || `Credits check failed (HTTP ${res.status})`);
        }
        return json;
    }
}
