
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
			author: { name: "Elo FIDE" },
			title: "🇦🇷 FM Cristian Sanhueza",
			url: "https://ratings.fide.com/profile/116815",
			color: 0x4e63bb, description: "",
			fields: [{
				name: "blitz",
				value: "`1200`",
				inline: true
			},{
				name: "rapid",
				value: "`1200`",
				inline: true
			},{
				name: "classical",
				value: "`1200`",
				inline: true
			}]
		}],
		flags: 0
	})
};
