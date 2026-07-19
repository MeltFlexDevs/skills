import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { MeltflexClient } from './api.js';
import { saveImages, saveBuffer, downloadToFile } from './util.js';
export function createServer() {
    const server = new McpServer({ name: 'meltflex', version: '0.5.0' });
    server.registerTool('generate_interior', {
        title: 'Generate interior design',
        description: 'Transform a room photo into a redesigned, photorealistic interior using MeltFlex AI. ' +
            'Provide a source room photo (local file path, http(s) URL, or data:image URL) and a prompt ' +
            'describing the desired style or changes. Optionally provide reference furniture/decor images ' +
            'to place specific products into the room. Supports output quality (512/1K/2K), a design level ' +
            '(lite/quick/pro), region editing via a red mask, and batch generation of up to 3 variations. ' +
            'Costs 10 credits per image (lite −2, pro +5), multiplied by the number of variations. ' +
            'Each result is saved to disk and the file paths are returned.',
        inputSchema: {
            prompt: z
                .string()
                .describe('What to do to the room, e.g. "Redesign in warm Scandinavian style with light oak floors and a beige linen sofa". Room structure (walls, windows, doors) is preserved unless you say otherwise.'),
            image: z
                .string()
                .describe('Source room photo: a local file path, an http(s) URL, or a data:image/...;base64,... URL.'),
            reference_images: z
                .array(z.string())
                .optional()
                .describe('Optional furniture/decor reference images (file paths or URLs) whose exact appearance should be placed into the room.'),
            resolution: z
                .enum(['512', '1K', '2K'])
                .optional()
                .describe('Output quality / resolution. "512" (fast), "1K", or "2K" (sharpest). Defaults to model auto.'),
            design_level: z
                .enum(['lite', 'quick', 'pro'])
                .optional()
                .describe('Effort tier: "lite" (faster & cheaper, −2 credits), "quick" (default), or "pro" (most detailed, HIGH thinking, +5 credits).'),
            mask: z
                .boolean()
                .optional()
                .describe('Region edit. When true, the source image must have the area to change painted SOLID RED; the prompt is applied ONLY to those red-marked regions and everything else is left untouched.'),
            variations: z
                .number()
                .int()
                .min(1)
                .max(3)
                .optional()
                .describe('Number of variations to generate in one batch: 1–3 (default 1). Credits are charged per image.'),
            output_path: z
                .string()
                .optional()
                .describe('Where to save the result. Defaults to ./meltflex-output/interior-<timestamp>.<ext>. For a batch, an index (-1, -2, …) is appended so files never collide.'),
        },
    }, async ({ prompt, image, reference_images, resolution, design_level, mask, variations, output_path }) => {
        try {
            const client = MeltflexClient.fromConfig();
            const { images, count, creditsUsed } = await client.generate({
                prompt,
                image,
                referenceImages: reference_images,
                resolution,
                designLevel: design_level,
                mask,
                variations,
            });
            const targets = saveImages(images, output_path);
            return {
                content: [
                    {
                        type: 'text',
                        text: `✅ ${count > 1 ? `${count} interior variations` : 'Interior'} generated and saved to:\n` +
                            targets.map((t) => `  • ${t}`).join('\n') +
                            `\n\nCredits used: ${creditsUsed}`,
                    },
                ],
            };
        }
        catch (err) {
            return {
                isError: true,
                content: [
                    {
                        type: 'text',
                        text: `MeltFlex generation failed: ${err?.message ?? String(err)}`,
                    },
                ],
            };
        }
    });
    server.registerTool('generate_video', {
        title: 'Generate interior walkthrough video',
        description: 'Animate a still image (a MeltFlex render or any interior photo) into a short cinematic ' +
            'walkthrough video using Veo 3.1. Costs 100 MeltFlex credits for a 4-second clip or 150 for ' +
            '8 seconds. Generation is asynchronous and can take 30–120 seconds. The MP4 is downloaded to ' +
            'disk and the file path is returned.',
        inputSchema: {
            image: z
                .string()
                .describe('Source still image: a local file path, an http(s) URL, or a data:image/...;base64,... URL.'),
            prompt: z
                .string()
                .optional()
                .describe('Optional camera/mood direction, e.g. "Slow dolly forward, then pan left to the window". Defaults to a slow cinematic dolly.'),
            duration_seconds: z
                .union([z.literal(4), z.literal(8)])
                .optional()
                .describe('Clip length: 4 (100 credits, default) or 8 (150 credits).'),
            aspect_ratio: z
                .enum(['16:9', '9:16'])
                .optional()
                .describe('"16:9" (default, landscape) or "9:16" (vertical).'),
            output_path: z
                .string()
                .optional()
                .describe('Where to save the .mp4. Defaults to ./meltflex-output/walkthrough-<timestamp>.mp4 in the current working directory.'),
        },
    }, async ({ image, prompt, duration_seconds, aspect_ratio, output_path }) => {
        try {
            const client = MeltflexClient.fromConfig();
            const result = await client.generateVideo({
                image,
                prompt,
                durationSeconds: duration_seconds,
                aspectRatio: aspect_ratio,
            });
            const target = await downloadToFile(result.videoUrl, output_path, 'walkthrough', 'mp4');
            return {
                content: [
                    {
                        type: 'text',
                        text: `✅ Walkthrough video (${result.durationSeconds}s, ${result.aspectRatio}) saved to:\n${target}\n\n` +
                            `Credits used: ${result.creditsUsed}` +
                            (result.processingTime ? ` • Generated in ${result.processingTime}s` : ''),
                    },
                ],
            };
        }
        catch (err) {
            return {
                isError: true,
                content: [
                    {
                        type: 'text',
                        text: `MeltFlex video generation failed: ${err?.message ?? String(err)}`,
                    },
                ],
            };
        }
    });
    server.registerTool('floorplan_to_3d', {
        title: 'Convert floorplan to 3D model',
        description: 'Convert a flat 2D floorplan image into a downloadable GLB 3D model. Costs 10 MeltFlex ' +
            'credits. The .glb is downloaded to disk and the file path is returned. Best results come ' +
            'from a clean, high-contrast floorplan with clear walls.',
        inputSchema: {
            image: z
                .string()
                .describe('Source 2D floorplan image (JPEG, PNG or WebP): a local file path, an http(s) URL, or a data:image/...;base64,... URL.'),
            output_path: z
                .string()
                .optional()
                .describe('Where to save the .glb. Defaults to ./meltflex-output/model-<timestamp>.glb in the current working directory.'),
        },
    }, async ({ image, output_path }) => {
        try {
            const client = MeltflexClient.fromConfig();
            const result = await client.floorplanTo3d({ image });
            let target;
            if (result.modelUrl) {
                target = await downloadToFile(result.modelUrl, output_path, 'model', 'glb');
            }
            else if (result.model) {
                target = saveBuffer(Buffer.from(result.model, 'base64'), output_path, 'model', 'glb');
            }
            else {
                throw new Error('No model returned by the API.');
            }
            return {
                content: [
                    {
                        type: 'text',
                        text: `✅ 3D model (${result.format}) saved to:\n${target}\n\nCredits used: ${result.creditsUsed}`,
                    },
                ],
            };
        }
        catch (err) {
            return {
                isError: true,
                content: [
                    {
                        type: 'text',
                        text: `MeltFlex floorplan conversion failed: ${err?.message ?? String(err)}`,
                    },
                ],
            };
        }
    });
    server.registerTool('check_credits', {
        title: 'Check MeltFlex credits',
        description: 'Check the current MeltFlex credit balance and the per-operation credit costs for the authenticated account.',
        inputSchema: {},
    }, async () => {
        try {
            const client = MeltflexClient.fromConfig();
            const c = await client.credits();
            const costLines = c.costs
                ? '\n\nCost per operation:\n' +
                    Object.entries(c.costs)
                        .map(([k, v]) => `  • ${k}: ${v} credits`)
                        .join('\n')
                : '';
            return {
                content: [
                    {
                        type: 'text',
                        text: `MeltFlex account${c.email ? ` (${c.email})` : ''}\n` +
                            `Balance: ${c.balance} credits\n` +
                            `Total earned: ${c.totalEarned} • Total spent: ${c.totalSpent}` +
                            costLines,
                    },
                ],
            };
        }
        catch (err) {
            return {
                isError: true,
                content: [
                    {
                        type: 'text',
                        text: `Could not fetch credits: ${err?.message ?? String(err)}`,
                    },
                ],
            };
        }
    });
    return server;
}
