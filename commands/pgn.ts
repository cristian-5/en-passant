
import { Chess } from "../core/chess.ts";
import { Command, CommandOptionType, CommandType } from "../types/command.ts";
import { Interaction, InteractionResponse } from "../types/interaction.ts";
import { Discord } from "../environment.ts";
import { Color, Positions } from "../core/positions.ts";

export const PGN: Command = {
	name: "pgn",
	type: CommandType.CHAT_INPUT,
	description: "📄 Diagramma da file pgn.",
	options: [{
		name: "pgn", type: CommandOptionType.ATTACHMENT, required: true,
		description: "File pgn contenente la partita",
	}, {
		name: "prospettiva", type: CommandOptionType.STRING, required: false,
		description: "Prosepettiva della scacchiera",
		choices: [
			{ name: "⬜️ Bianco", value: "white" },
			{ name: "⬛️ Nero", value: "black" }
		]
	}],
	run: async (interaction: Interaction): Promise<InteractionResponse> => {
		const pgn = interaction.data.options![0].value;
		console.log(interaction.data.options);
		return Discord.error(
			"Posizione FEN Invalida",
			"La notazione contiene errori.\n"
		);
	}
};
