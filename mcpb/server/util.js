import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, isAbsolute, join } from 'node:path';
/** Filesystem-safe timestamp like 2026-06-02_16-02-11. */
export function timestamp() {
    return new Date()
        .toISOString()
        .replace(/[:.]/g, '-')
        .replace('T', '_')
        .slice(0, 19);
}
/** Decode a `data:image/...;base64,...` URL into a Buffer + a file extension. */
export function dataUrlToBuffer(dataUrl) {
    const m = dataUrl.match(/^data:image\/(\w+);base64,(.+)$/);
    if (!m)
        throw new Error('Unexpected image format (expected a data:image/... URL)');
    return {
        buffer: Buffer.from(m[2], 'base64'),
        ext: m[1] === 'jpeg' ? 'jpg' : m[1],
    };
}
/**
 * Resolve where to write a generated image. If `outputPath` is given it is used
 * (relative paths are resolved against cwd); otherwise a timestamped file under
 * ./meltflex-output is returned.
 */
export function resolveOutputPath(outputPath, ext) {
    if (outputPath && outputPath.trim()) {
        return isAbsolute(outputPath) ? outputPath : join(process.cwd(), outputPath);
    }
    return join(process.cwd(), 'meltflex-output', `interior-${timestamp()}.${ext}`);
}
/** Decode a result data URL and write it to disk, creating parent dirs. Returns the path. */
export function saveImage(dataUrl, outputPath) {
    const { buffer, ext } = dataUrlToBuffer(dataUrl);
    const target = resolveOutputPath(outputPath, ext);
    mkdirSync(dirname(target), { recursive: true });
    writeFileSync(target, buffer);
    return target;
}
