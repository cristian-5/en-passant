
import { Discord } from "./environment.ts";
import { Command } from "./types/command.ts";
import { COMMANDS } from "./commands.ts";

const GLOBAL_REGISTRATION = "", GUILD_REGISTRATION = `guilds/${Discord.SERVER_ID}/`;
export async function register(commands: Command[], global: string = GUILD_REGISTRATION) {
	const response = await fetch(Discord.API_URL + global + "commands", {
		method: "PUT", headers: Discord.API_HEADERS, body: JSON.stringify(commands),
	});
	if (!response.ok) throw (await response.json());
	return await response.json();
}

export async function remove(command: Command, global: string = GLOBAL_REGISTRATION) {
	const url = Discord.API_URL + global + "commands/"; // get all commands
	let response = await fetch(url, { method: "GET", headers: Discord.API_HEADERS });
	if (!response.ok) throw (await response.json());
	const commands = await response.json();
	const commandId = commands.find((c: Command) => c.name === command.name)?.id;
	if (commandId === undefined) throw new Error(`Command ${command.name} not found.`);
	console.log(commandId);
	response = await fetch(url + commandId, { method: "DELETE", headers: Discord.API_HEADERS });
	if (!response.ok) throw (await response.json());
	return await response.json();
}

try {
	await register(COMMANDS, GLOBAL_REGISTRATION);
	console.log(`✅ Commands registered successfully.`);
} catch (error) {
	console.error(`❌ Error registering commands:`, error);
}

//for (const command of COMMANDS) await remove(command, GUILD_REGISTRATION);
