
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
