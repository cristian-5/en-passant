
import { Chess } from "../core/chess.ts";
import { Command, CommandOptionType, CommandType } from "../types/command.ts";
import { Interaction, InteractionResponse } from "../types/interaction.ts";
import { Discord } from "../environment.ts";
import { Color, Positions } from "../core/positions.ts";
import { parse } from "../core/pgn.js";

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
		let perspective: Color = "w";
		if (interaction.data.options!.length > 1)
			perspective = (interaction.data.options![1].value! as string)[0] as Color;
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
	const t = control(headers["TimeControl"] || "");
	if (t !== undefined) status += " ・ " + t;
	return status;
}

function description(game: Chess): string | undefined {
	const headers = game.getHeaders();
	const w = headers["White"], b = headers["Black"];
	if (w != undefined && b != undefined)
		return `⬜️ **\`${w}\`** vs **\`${b}\`** ⬛️`;
}

function control(t: string): string | undefined {
	if (t === "" || t === "?" || t === "-") return undefined;
	const fields = t.split(":");
	const min = (s: number): string => (s % 60 === 0 ? (s / 60).toString() : (s / 60).toFixed(1));
	const last = fields[fields.length - 1];
	console.log("Control:", t, last);
	if (/^\d+\/\d+$/.test(last)) // "moves/seconds" (e.g., "40/9000")
		return `🕰️ \`${min(parseInt(last.split("/")[1]))}\``;
	if (/^\d+$/.test(last)) // sudden death (e.g., "300" = 5 min)
		return `🕰️ \`${min(parseInt(last))}\``;
	if (/^\d+\+\d+$/.test(last)) { // base+increment (e.g., "300+2")
		const [base, inc] = last.split("+").map(parseInt);
		return `🕰️ \`${min(base)}+${inc}\``;
	}
	if (/^\*\d+$/.test(last)) { // sandclock (e.g., "*180")
		const seconds = parseInt(last.slice(1));
		return `🕰️ \`${min(seconds)}\``;
	}
}
