
import { Command, CommandType, CommandOptionType } from "../types/command.ts";
import { Interaction, InteractionResponse } from "../types/interaction.ts";
import { Discord } from "../environment.ts";
import { fide    } from "../core/site/fide.com.ts";
import { lichess } from "../core/site/lichess.org.ts";
import { Chess   } from "../core/site/chess.com.ts";

const colors: { [platform: string]: number } = {
	"fide.com": 0x4e63bb, "lichess.org": 0xFFFFFF, "chess.com": 0x7FA650
};
const platforms: { [platform: string]: string } = {
	"fide.com": "FIDE", "lichess.org": "lichess.org", "chess.com": "Chess.com"
};
const highlight = (p: string) => (p == 'FIDE' ? '**FIDE**' : `__${p}__`);
const emojis: { [platform: string]: string } = {
	"bullet": ":gun:", "rapid": ":stopwatch:",
	"blitz": ":zap:", "standard": ":clock:",
	"classical": ":hourglass:"
};

export const Elo: Command = {
	name: "elo",
	type: CommandType.CHAT_INPUT,
	description: "📈 Mostra il tuo elo online.",
	options: [{
		description: "Sito da cui recuperare i dati.",
		name: "sito", type: CommandOptionType.STRING, required: true,
		choices: [
			{ name: "🔵  FIDE", value: "fide.com" },
			{ name: "⚪️  lichess.org", value: "lichess.org" },
			{ name: "🟢  Chess.com", value: "chess.com" }
		]
	}, {
		description: "Nome utente utilizzato sul sito.",
		name: "username", type: CommandOptionType.STRING, required: true
	}],
	run: async (interaction: Interaction): Promise<InteractionResponse> => {
		const platform = interaction.data.options![0].value! as string;
		const fidename = (interaction.data.options![1].value! as string)
			.replace(/[^a-zA-Z0-9_\- ]/g, "").trim();
		let username = fidename.replace(/\s+/g, ""), ratings = null, player = null, flag = "";
		switch (platform) {
			case    "fide.com":
				player = await fide.com.player(fidename);
				if (player === null) return /^\d+$/.test(fidename) ? Discord.error(
					"Ricerca Elo FIDE",
					`Impossibile trovare l'**ID FIDE** \`${fidename}\`.`
				) : Discord.warn( // could not find FIDE ID for the specified name:
					"Ricerca Elo FIDE",
					`Impossibile trovare l'**ID FIDE** di \`${fidename}\`.`
				);
				username = player.name.split(/\s*,\s*/).reverse().join(" ");
				flag = (player.flag || "") + " ";
				ratings = player.ratings;
			break;
			case "lichess.org": ratings = await lichess.org.ratings(username); break;
			case   "chess.com": ratings = await   Chess.com.ratings(username); break;
		}
		return ratings === null ? Discord.error(
			`Utente ${platforms[platform]} non trovato`,
			`Impossibile trovare l'utente \`${username}\`.`
		) : Discord.card(
			`Elo ${platforms[platform]} – ` + flag + username,
			Object.entries(ratings).filter(([category, _]) => category in emojis).map(
				([c, { rating }]) => `${emojis[c]} **${c}** \`${rating > 0 ? rating : "-"}\``
			).join('** ｜ **'),
			colors[platform]
		);
	}
};
