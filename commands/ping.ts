
import { Command, CommandType } from "../types/command.ts";
import { Interaction, InteractionResponse } from "../types/interaction.ts";
import { ColorCodes, Discord } from "../environment.ts";

export const Ping: Command = {
	name: "ping",
	type: CommandType.CHAT_INPUT,
	description: "🏓 Controlla lo stato del bot.",
	options: [],
	run: async (interaction: Interaction): Promise<InteractionResponse> => Discord.card(
		"Pong",
		`:ping_pong: Server latency: \`${
			Date.now() - Discord.snow(interaction.id)
		}ms\``, 0xdd2d44
	)
};
