
import { Command, CommandType } from "../types/command.ts";
import { Interaction, InteractionResponse } from "../types/interaction.ts";
import { ColorCodes, Discord } from "../environment.ts";

export const Ping: Command = {
	name: "ping",
	type: CommandType.CHAT_INPUT,
	description: "🏓 Controlla lo stato del bot.",
	options: [],
	run: async (interaction: Interaction): Promise<InteractionResponse> => Discord.card(
		"Ping",
		`:ping_pong: **Pong**. Server latency: \`${
			Date.now() - Discord.snow(interaction.id)
		}ms\``,
		ColorCodes.normal
	)
};
