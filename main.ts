
import { json, serve, validateRequest } from "https://deno.land/x/sift@0.6.0/mod.ts";
import nacl from "https://esm.sh/tweetnacl@v1.0.3?dts";
import { Discord } from "./environment.ts";
import { Interaction, InteractionType, InteractionCallbackType, InteractionResponse } from "./types/interaction.ts";
import { MultipartData } from "./core/multipart.ts";
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
		/* DEFERRED COMMANDS (ASYNCHRONOUS)
		if (command.deferred) {
			command.run(interaction).then(respond); // run in the background, then send a response
			// in the meantime acknowledge the interaction (runs before the previous line):
			return json({ type: InteractionCallbackType.DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE });
		}*/
		// NON DEFERRED COMMANDS (SYNCRONOUS)
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

/*async function respond(interaction_token: string, response: InteractionResponse) {
	await fetch(Discord.WEBHOOK_URL + `/${interaction_token}`, {
		method: "POST",
		headers: Discord.API_HEADERS,
		body: JSON.stringify({
			type: InteractionCallbackType.CHANNEL_MESSAGE_WITH_SOURCE,
			data: response,
		})
	});
}*/

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

	const multipart = new MultipartData("discord-boundary");
	multipart.addJSON("payload_json", payload);

	for (let i = 0; i < files.length; i++)
		multipart.addFile(`files[${i}]`, files[i].name, files[i].data, files[i].mime);

	console.log("ABOUT TO SEND MULTIPART RESPONSE");

	const m = multipart.build();
	console.log(await m.text());
	return m;
}

/*async function multipart(payload: InteractionResponse): Promise<Response> {
	const files = payload.files!;
	delete payload.files; // avoid sending files in JSON
	const BOUNDARY = "discord-boundary";
	const { readable, writable } = new TransformStream();
	const writer = new MultipartWriter(writable.getWriter(), BOUNDARY);

	payload.attachments = files.map((file, index) => ({
		id: index.toString(), filename: file.name
	}));

	await writer.writeField("payload_json", JSON.stringify(payload));

	for (let i = 0; i < files.length; i++) await writer.writeFile(
		`files[${i}]`, files[i].name,
		new Blob([files[i].data], { type: files[i].mime ?? "application/octet-stream" })
	);

	await writer.close();

	return new Response(readable, {
		status: 200,
		headers: { "Content-Type": `multipart/form-data; boundary=${BOUNDARY}` }
	});

}*/
