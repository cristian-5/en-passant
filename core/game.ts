
import { Chess } from "./chess.ts";

export function status(game: Chess): string {
	let status = "";
	if (game.isGameOver()) {
		if (game.isDraw()) status = "½-½ ・ Pareggio";
		else if (game.isCheckmate())
			status = game.turn() === 'w' ? "0-1 ・ ⬛️ Vince il Nero" : "1-0 ・ ⬜️ Vince il Bianco";
	} else status = game.turn() === 'w' ? "⬜️ Muove il Bianco" : "⬛️ Muove il Nero";
	return status;
}

export function description(headers: Record<string, string>): string {
	const w = headers["White"], b = headers["Black"];
	let description = "";
	if (w != undefined && b != undefined)
		description = `⬜️ **\`${w}\`** vs **\`${b}\`** ⬛️`;
	const t = headers["TimeControl"];
	if (t !== undefined && t !== "") description += ` ・ **Tempo:** \`${control(t)}\``;
	return description;
}

export function control(t: string): string {
	const match = t.match(/(\d+)\s*(?:\+\s*(\d+))?/);
	if (match === null) return t;
	return (
		match.slice(1)
		.map(e => !(parseInt(e) % 60) ? parseInt(e) / 60 : parseInt(e))
		.map(e => e || '0').join('+')
	);
}
