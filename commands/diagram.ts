
import { Chess } from "../core/chess.ts";
import { Command, CommandOptionType, CommandType } from "../types/command.ts";
import { Interaction, InteractionResponse } from "../types/interaction.ts";
import { ColorCodes, Discord } from "../environment.ts";

export const FEN: Command = {
	name: "fen",
	type: CommandType.CHAT_INPUT,
	description: "📋 Diagramma da notazione FEN.",
	options: [{
		name: "fen", type: CommandOptionType.STRING, required: true,
		description: "Notazione Forsyth–Edwards",
	}, {
		name: "prospettiva", type: CommandOptionType.STRING, required: false,
		description: "Prosepettiva della scacchiera",
		choices: [
			{ name: "⬜️ Bianco", value: "white" },
			{ name: "⬛️ Nero", value: "black" }
		]
	}],
	run: async (interaction: Interaction): Promise<InteractionResponse> => {
		const title = "Posizione";
		const fen = (interaction.data.options![0].value! as string).trim();
		let game;
		try { game = new Chess(fen); } catch (e) {
			return Discord.error(
				"Posizione FEN Invalida",
				`**FEN:** \`${fen}\`\n` +
				"https://it.wikipedia.org/wiki/Notazione_Forsyth-Edwards"
			);
		}
		let status = "";
		if (game.isGameOver()) {
			if (game.isDraw()) status = "½-½ ・ Pareggio";
			else if (game.isCheckmate())
				status = game.turn() === 'w' ? "0-1 ・ ⬛️ Vince il Nero" : "1-0 ・ ⬜️ Vince il Bianco";
		} else status = game.turn() === 'w' ? "⬜️ Muove il Bianco" : "⬛️ Muove il Nero";
		let perspective = game.turn() === 'w' ? "white" : "black";
		if (interaction.data.options!.length > 1)
			perspective = interaction.data.options![1].value! as string;
		/*const diagram = await fetch(FENURL + perspective + '/' + fen.replace(/\s.+$/, ''));
		if (diagram.status != 200) return error(
			"FEN Diagram Issue",
			`**FEN:** \`${fen}\`\n` +
			"There was an issue generating the diagram."
		);
		const filename = fen.replace(/[^A-Za-z0-9_.\-]/g, '_') + ".png";
		return {
			file: [{ blob: await diagram.blob(), name: filename }],
			embeds: [{
				type: "image", title, color: game.turn == 'w' ? 0xFFFFFF : 0x000000,
				image: { url: "attachment://" + filename, height: 800, width: 800 },
				description: "**FEN: **`" + fen + "`", footer: { text: status },
			}]
		};*/
	}
};
