
import { Discord } from "./environment.ts";
import { Command } from "./types/command.ts";
import { COMMANDS } from "./commands.ts";

const GLOBAL_REGISTRATION = "", GUILD_REGISTRATION = `guilds/${Discord.SERVER_ID}/`;
export async function register(command: Command, global: string = GUILD_REGISTRATION) {
	const response = await fetch(Discord.API_URL + global + "commands", {
		method: "POST", headers: Discord.API_HEADERS, body: JSON.stringify(command),
	});
	if (!response.ok) throw (await response.json());
	return await response.json();
}

export async function remove(command: Command, global: string = GLOBAL_REGISTRATION) {
	const url = Discord.API_URL + global + "commands/"; // get all commands
	let response = await fetch(url, { method: "GET", headers: Discord.API_HEADERS });
	if (!response.ok) throw (await response.json());
	const COMMANDS = await response.json();
	const commandId = COMMANDS.find((c: Command) => c.name === command.name)?.id;
	if (commandId === undefined) throw new Error(`Command ${command.name} not found.`);
	response = await fetch(url + commandId, { method: "DELETE", headers: Discord.API_HEADERS });
	if (!response.ok) throw (await response.json());
	return await response.json();
}

for (const command of COMMANDS) {
	try {
		await register(command, GUILD_REGISTRATION);
		console.log(`✅ Command ${command.name} registered successfully.`);
	} catch (error) {
		console.error(`❌ Error registering command ${command.name}:`, error);
	}
}

// await remove(Ping, GUILD_REGISTRATION);
