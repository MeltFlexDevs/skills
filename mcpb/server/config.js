import { homedir } from 'node:os';
import { join } from 'node:path';
import { readFileSync, writeFileSync, mkdirSync, existsSync, chmodSync, } from 'node:fs';
const CONFIG_DIR = join(homedir(), '.meltflex');
export const CONFIG_PATH = join(CONFIG_DIR, 'config.json');
export const DEFAULT_BASE_URL = 'https://www.meltflexai.com';
function readFile() {
    if (!existsSync(CONFIG_PATH))
        return {};
    try {
        return JSON.parse(readFileSync(CONFIG_PATH, 'utf8'));
    }
    catch {
        return {};
    }
}
/**
 * Resolve config. Environment variables win over the on-disk config file so
 * that hosted/CI setups (e.g. an `env` block in the MCP client config) work
 * without an interactive `meltflex auth` step.
 */
export function loadConfig() {
    const file = readFile();
    return {
        apiKey: process.env.MELTFLEX_API_KEY || file.apiKey,
        baseUrl: process.env.MELTFLEX_BASE_URL || file.baseUrl || DEFAULT_BASE_URL,
    };
}
/** Persist the API key to ~/.meltflex/config.json with owner-only perms. */
export function saveApiKey(apiKey) {
    if (!existsSync(CONFIG_DIR))
        mkdirSync(CONFIG_DIR, { recursive: true });
    const next = { ...readFile(), apiKey };
    writeFileSync(CONFIG_PATH, JSON.stringify(next, null, 2));
    try {
        chmodSync(CONFIG_PATH, 0o600);
    }
    catch {
        /* best-effort on platforms without POSIX perms */
    }
    return CONFIG_PATH;
}
