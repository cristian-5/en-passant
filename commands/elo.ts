
import { Command, CommandType, CommandOptionType } from "../types/command.ts";
import { Interaction, InteractionResponse } from "../types/interaction.ts";
import { Discord } from "../environment.ts";
import { fide    } from "../core/site/fide.com.ts";
import { lichess } from "../core/site/lichess.org.ts";
import { Chess   } from "../core/site/chess.com.ts";

const colors: { [platform: string]: number } = {
	"fide": 0xF1C40F, "lichess.org": 0xFFFFFF, "chess.com": 0x7FA650
};
const platforms: { [platform: string]: string } = {
	"fide": "FIDE", "lichess.org": "lichess.org", "chess.com": "Chess.com"
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
		let username = fidename.replace(/\s+/g, ""), ratings;
		switch (platform) {
			case    "fide.com": ratings = await    fide.com.ratings(fidename); break;
			case "lichess.org": ratings = await lichess.org.ratings(username); break;
			case   "chess.com": ratings = await   Chess.com.ratings(username); break;
		}
		if (ratings === null || ratings === undefined) {
			if (platform === "fide.com") return /^\d+$/.test(fidename) ? Discord.error(
				"Ricerca Elo FIDE",
				`Impossibile trovare l'**ID FIDE** \`${fidename}\`.`
			) : Discord.warn( // could not find FIDE ID for the specified name:
				"Ricerca Elo FIDE",
				`Impossibile trovare l'**ID FIDE** di \`${fidename}\`.\n` +
				"Riprova con l'**ID** in modo da salvarlo per il futuro."
			);
			return Discord.error(
				`Utente ${platforms[platform]} non trovato`,
				`Impossibile trovare l'utente \`${username}\`.`
			);
		}
		return Discord.card(
			`Elo ${platforms[platform]} – ${username}`,
			Object.entries(ratings).filter(([category, _]) => category in emojis).map(
				([category, { rating }]) => `${emojis[category]} **${category}** \`${rating > 0 ? rating : "-"}\``
			).join('** ｜ **'),
			colors[platform]
		);
	}
};
