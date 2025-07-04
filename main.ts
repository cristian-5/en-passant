
import { json, serve, validateRequest } from "https://deno.land/x/sift@0.6.0/mod.ts";
import nacl from "https://esm.sh/tweetnacl@v1.0.3?dts";
import { Discord } from "./environment.ts";
import { Interaction, InteractionType, InteractionCallbackType, InteractionResponse } from "./types/interaction.ts";
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
		const data = await command.run(interaction);
		if (data.files && data.files!.length > 0) return multipart(data); // sending files
		return json({ type: InteractionCallbackType.CHANNEL_MESSAGE_WITH_SOURCE, data });
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
	return new Uint8Array(hex.match(/.{1,2}/g)!.map(v => parseInt(v, 16)));
}

async function multipart(response: InteractionResponse): Promise<Response> {

	const files = response.files!;
	delete response.files; // avoid sending files in JSON

	response.attachments = files.map((file, index) => ({
		id: index.toString(), filename: file.name
	}));
		
	const payload = {
		type: InteractionCallbackType.CHANNEL_MESSAGE_WITH_SOURCE,
		data: response
	};

	const form = new FormData();
	form.append("payload_json", JSON.stringify(payload));

	for (let i = 0; i < files.length; i++) form.append(
		`files[${i}]`,
		new Blob([files[i].data], { type: files[i].mime ?? "application/octet-stream" }),
		files[i].name
	);

	return new Response(form);
}
