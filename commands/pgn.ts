
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
		const file_id = interaction.data.options![0].value! as string;
		const attachment = interaction.data.resolved!.attachments![file_id];
		if (attachment === undefined || !attachment.filename.endsWith(".pgn"))
			return Discord.error(
				"File Non Riconosciuto",
				`Il file deve avere estensione \`.pgn\`.`
			);
		const response = await fetch(attachment.url!);
		if (!response.ok) return Discord.error(
			"File PGN Inesistente",
			`Impossibile recuperare il file pgn: \`${attachment.filename}\``
		);
		const game = new Chess();
		try { game.loadPgn(await response.text()); } catch (e) {
			return Discord.error(
				"File PGN Invalido",
				`Impossibile leggere il pgn: \`${e}\`.`
			);
		}
		const perspective = (interaction.data.options![1].value! as string)[0] as Color;
		const positions = new Positions(perspective);
		do positions.prepend(game.board());
		while (game.undo() !== null);
		const diagram = await positions.gif();
		if (diagram === null) return Discord.error(
			"File PGN Invalido",
			"La notazione contiene errori.\n" +
			"https://it.wikipedia.org/wiki/Notazione_Portable_Game"
		);
		const filename = "preview.gif";//attachment.filename.replace(/\.pgn$/, ".gif").replace(/[^a-zA-Z0-9]+/g, "_");
		return {
			files: [{ data: diagram!, name: filename, mime: "image/gif" }],
			embeds: [{
				type: "gifv", title: "Anteprima Partita",
				color: game.turn() === 'w' ? 0xFFFFFF : 0x000000,
				image: { url: "attachment://" + filename, height: 400, width: 400 },
				description: description(game), footer: { text: status(game) }
			}]
		};
	}
};

function status(game: Chess): string {
	let status = '';
	if (game.isGameOver()) {
		if (game.isDraw()) status = "½-½ ・ Draw";
		else if (game.isCheckmate()) status = (
			game.turn() === 'w' ? "0-1 ・ ⬛️ Vince il Nero" : "1-0 ・ ⬜️ Vince il Bianco"
		);
	}
	const headers = game.getHeaders();
	const t = headers["TimeControl"];
	if (t !== undefined && t !== "" && t !== "-") status += ` ・ **Tempo:** \`${control(t)}\``;
	return status;
}

function description(game: Chess): string | undefined {
	const headers = game.getHeaders();
	const w = headers["White"], b = headers["Black"];
	if (w != undefined && b != undefined)
		return `⬜️ **\`${w}\`** vs **\`${b}\`** ⬛️`;
}

function control(t: string): string {
	const match = t.match(/(\d+)\s*(?:\+\s*(\d+))?/);
	if (match === null) return t;
	return (
		match.slice(1)
		.map(e => !(parseInt(e) % 60) ? parseInt(e) / 60 : parseInt(e))
		.map(e => e || '0').join('+')
	);
}
