
import { Chess } from "../core/chess.ts";
import { Command, CommandOptionType, CommandType } from "../types/command.ts";
import { Interaction, InteractionResponse } from "../types/interaction.ts";
import { Discord } from "../environment.ts";
import { Color, Position } from "../core/positions.ts";

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
		let perspective = game.turn();
		if (interaction.data.options!.length > 1)
			perspective = (interaction.data.options![1].value! as string)[0] as Color;
		const diagram = await png_from(game, perspective);
		if (diagram === null) return Discord.error(
			"Posizione FEN Invalida",
			"La notazione contiene errori.\n" +
			"https://it.wikipedia.org/wiki/Notazione_Forsyth-Edwards" +
			"\n`" + fen + "`"
		);
		return {
			files: [{ data: diagram!, name: "fen.png", mime: "image/png" }],
			embeds: [{
				type: "image", title: "Posizione FEN",
				color: game.turn() === 'w' ? 0xFFFFFF : 0x000000,
				image: { url: "attachment://fen.png", height: 400, width: 400 },
				description: "`" + fen + "`", footer: { text: status },
			}]
		};
	}
};

async function png_from(game: Chess, perspective: Color) {
	const diagram = new Position(game.board());
	return await diagram.picture(perspective);
}
