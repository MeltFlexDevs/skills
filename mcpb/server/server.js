import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { MeltflexClient } from './api.js';
import { saveImage } from './util.js';
export function createServer() {
    const server = new McpServer({ name: 'meltflex', version: '0.1.0' });
    server.registerTool('generate_interior', {
        title: 'Generate interior design',
        description: 'Transform a room photo into a redesigned, photorealistic interior using MeltFlex AI. ' +
            'Provide a source room photo (local file path, http(s) URL, or data:image URL) and a prompt ' +
            'describing the desired style or changes. Optionally provide reference furniture/decor images ' +
            'to place specific products into the room. Costs 10 MeltFlex credits per generation. ' +
            'The result is saved to disk and the file path is returned.',
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
            output_path: z
                .string()
                .optional()
                .describe('Where to save the result image. Defaults to ./meltflex-output/interior-<timestamp>.<ext> in the current working directory.'),
        },
    }, async ({ prompt, image, reference_images, output_path }) => {
        try {
            const client = MeltflexClient.fromConfig();
            const { image: dataUrl, creditsUsed } = await client.generate({
                prompt,
                image,
                referenceImages: reference_images,
            });
            const target = saveImage(dataUrl, output_path);
            return {
                content: [
                    {
                        type: 'text',
                        text: `✅ Interior generated and saved to:\n${target}\n\nCredits used: ${creditsUsed}`,
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
