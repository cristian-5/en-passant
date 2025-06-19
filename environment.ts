
import { InteractionResponse } from "./types/interaction.ts";
import { MessageFlags } from "./types/message.ts";

export const Bot = {
	NAME: "en passant",
	VERSION: "1.0.0",
	OWNER: "Cristian Antonuccio",
};

export const Discord = {
	TOKEN: Deno.env.get("DISCORD_TOKEN")!,
	APP_ID: Deno.env.get("DISCORD_APP_ID")!,
	SERVER_ID: Deno.env.get("DISCORD_SERVER_ID")!,
	PUBLIC_KEY: Deno.env.get("DISCORD_PUBLIC_KEY")!,
	API_URL: `https://discord.com/api/v10/applications/${Deno.env.get("DISCORD_APP_ID")}/`,
	API_HEADERS: {
		"Content-Type": "application/json",
		"Authorization": `Bot ${Deno.env.get("DISCORD_TOKEN")}`,
	},
	snow: (id: string): number => Number(BigInt(id) / 4194304n + 1420070400000n),
	card: (title: string, message: string, color: number | undefined, silent = false): InteractionResponse => ({
		embeds: [{
			title: title || Bot.NAME,
			color: color || ColorCodes.normal,
			description: message || ""
		}], flags: silent ? MessageFlags.EPHEMERAL : 0 // ephemeral message (only visible to the user)
	}),
	error: (title: string, message: string): InteractionResponse => ({
		embeds: [{
			title: title || Bot.NAME,
			color: ColorCodes.error,
			description: ":no_entry_sign: " + (message || "Error!")
		}], flags: MessageFlags.EPHEMERAL
	})

};

export const ColorCodes = {
	normal: 0x1ABC9C,
	error: 0xDD2E44,
	success: 0x77B255,
	info: 0x3C88C3,
	warn: 0xFFCC4D,
	titled: 0xF1C40F,
	random: () => Math.floor(Math.random() * (0xFFFFFF + 1))
};
