
import { Chess } from "../core/chess.ts";
import { Command, CommandOptionType, CommandType } from "../types/command.ts";
import { Interaction, InteractionResponse } from "../types/interaction.ts";
import { Discord } from "../environment.ts";
import { Color, Position } from "../core/positions.ts";

export const FEN: Command = {
	name: "fen",
	type: CommandType.CHAT_INPUT,
	description: "🏷️ Diagramma da notazione FEN.",
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
		const fen = (interaction.data.options![0].value! as string).trim();
		let game;
		try { game = new Chess(fen); } catch (e) {
			return Discord.error(
				"Posizione FEN Invalida",
				`**FEN:** \`${fen}\`\n` +
				"https://it.wikipedia.org/wiki/Notazione_Forsyth-Edwards"
			);
		}
		let perspective: Color = "w";
		if (interaction.data.options!.length > 1)
			perspective = (interaction.data.options![1].value! as string)[0] as Color;
		const diagram = await (new Position(game.board())).picture(perspective);
		if (diagram === null) return Discord.error(
			"Posizione FEN Invalida",
			"La notazione contiene errori.\n" +
			"https://it.wikipedia.org/wiki/Notazione_Forsyth-Edwards" +
			"\n`" + fen + "`"
		);
		const filename = fen.replace(/[^a-zA-Z0-9]+/g, "_") + ".png";
		return {
			files: [{ data: diagram!, name: filename, mime: "image/png" }],
			embeds: [{
				type: "image", title: "Posizione FEN",
				color: game.turn() === 'w' ? 0xFFFFFF : 0x000000,
				image: { url: "attachment://" + filename, height: 400, width: 400 },
				description: "`" + fen + "`", footer: { text: status(game) }
			}]
		};
	}
};

export function status(game: Chess): string {
	let status = "";
	if (game.isGameOver()) {
		if (game.isDraw()) status = "½-½ ・ Pareggio";
		else if (game.isCheckmate())
			status = game.turn() === 'w' ? "0-1 ・ ⬛️ Vince il Nero" : "1-0 ・ ⬜️ Vince il Bianco";
	} else status = game.turn() === 'w' ? "⬜️ Muove il Bianco" : "⬛️ Muove il Nero";
	return status;
}
