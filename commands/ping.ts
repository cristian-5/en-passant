
import { Command, CommandType } from "../types/command.ts";
import { Interaction, InteractionResponse } from "../types/interaction.ts";
import { ColorCodes, Discord } from "../environment.ts";

export const Ping: Command = {
	name: "ping",
	type: CommandType.CHAT_INPUT,
	description: "🏓 Controlla lo stato del bot.",
	options: [],
	run: async (interaction: Interaction): Promise<InteractionResponse> => /*Discord.card(
		"Ping",
		`:ping_pong: **Pong**. Server latency: \`${
			Date.now() - Discord.snow(interaction.id)
		}ms\``,
		ColorCodes.normal
	)*/
	({
		embeds: [{
			author: { name: "Elo FIDE - 116815", url: "https://ratings.fide.com/profile/116815" },
			title: "🇦🇷 FM Cristian Sanhueza",
			color: 0x4e63bb, description: "",
			fields: [{
				name: "BTZ ⚡️",
				value: "`1200`",
				inline: true
			},{
				name: "RPD ⏱️",
				value: "`1200`",
				inline: true
			},{
				name: "STD 🕰️",
				value: "`1200`",
				inline: true
			}]
		}],
		flags: 0
	})
};
