
import { json, serve, validateRequest } from "https://deno.land/x/sift@0.6.0/mod.ts";
import nacl from "https://esm.sh/tweetnacl@v1.0.3?dts";
import { Discord } from "./environment.ts";
import { Interaction, InteractionType, InteractionCallbackType } from "./types/interaction.ts";
import { COMMANDS } from "./commands.ts";

serve({ "/": main });

async function main(request: Request) {
	// ensures that request is POSTed with the following headers:
	const { error } = await validateRequest(request, {
		POST: { headers: ["X-Signature-Ed25519", "X-Signature-Timestamp"] }
	});
	if (error) return json({ error: error.message }, { status: error.status });
	// verifySignature() verifies if the request is coming from Discord,
	// important as Discord sends invalid requests to test our verification:
	const { valid, body } = await verifySignature(request);
	if (!valid) return json({ error: "Invalid request" }, { status: 401 });
	const interaction: Interaction = JSON.parse(body) as Interaction;
	if (interaction.type === InteractionType.PING)
		return json({ type: InteractionCallbackType.PONG });
	if (interaction.type === InteractionType.APPLICATION_COMMAND) {
		const command = COMMANDS.find((cmd) => cmd.name === interaction.data.name);
		if (command === undefined) return json({ type: 4, data: { content: "Error: COMMAND NOT FOUND" } });
		return json({
			type: InteractionCallbackType.CHANNEL_MESSAGE_WITH_SOURCE,
			data: await command.run(interaction)
		});
	}
	return json({ error: "Bad Request" }, { status: 400 });
}

/// Verifies whether the request is coming from Discord.
async function verifySignature(request: Request): Promise<{ valid: boolean; body: string }> {
	const signature = request.headers.get("X-Signature-Ed25519")!;
	const timestamp = request.headers.get("X-Signature-Timestamp")!;
	const body = await request.text();
	const valid = nacl.sign.detached.verify(
		new TextEncoder().encode(timestamp + body),
		hexToUint8Array(signature),
		hexToUint8Array(Discord.PUBLIC_KEY),
	);
	return { valid, body };
}

/// Converts a hexadecimal string to Uint8Array.
function hexToUint8Array(hex: string) {
	return new Uint8Array(
		hex.match(/.{1,2}/g)!.map((val) => parseInt(val, 16)),
	);
}
