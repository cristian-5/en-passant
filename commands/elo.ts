
import { Command, CommandType, CommandOptionType } from "../types/command.ts";
import { Interaction, InteractionResponse } from "../types/interaction.ts";
import { Discord } from "../environment.ts";
import { lichess } from "../core/lichess.org.ts";

type Ratings = { [category: string]: { rating: number } };
const colors: { [platform: string]: number } = {
	"FIDE": 0xF1C40F, "lichess.org": 0xFFFFFF, "Chess.com": 0x7FA650
};
const platforms: { [platform: string]: string } = {
	"fide": "FIDE", "lichess.org": "lichess.org", "chess.com": "Chess.com"
};
const highlight = (p: string) => (p == 'FIDE' ? '**FIDE**' : `__${p}__`);
const emojis: { [platform: string]: string } = {
	"FIDE": ":yellow_heart:", "lichess.org": ":white_heart:",
	"chess.com": ":green_heart:", "bullet": ":gun:", "rapid": ":stopwatch:",
	"blitz": ":zap:", "standard": ":clock:", "classical": ":hourglass:"
};

export const ELO: Command = {
	name: "elo",
	type: CommandType.CHAT_INPUT,
	description: "📈 Mostra il tuo elo online.",
	options: [{
		description: "Sito da cui recuperare i dati.",
		name: "sito", type: CommandOptionType.STRING, required: true,
		choices: [
			{ name: "lichess.org", value: "lichess.org" },
			{ name: "Chess.com", value: "chess.com" }
		]
	}, {
		description: "Nome utente utilizzato sul sito.",
		name: "username", type: CommandOptionType.STRING, required: true
	}],
	run: async (interaction: Interaction): Promise<InteractionResponse> => {
		const platform = interaction.data.options![0].value! as string;
		const username = (interaction.data.options![1].value! as string).replace(/\w|\-/g, "").trim();
		let ratings;
		switch (platform) {
			/*case "fide": {
				const card = await fideCard(author, username);
				if (card === undefined) continue;
				list.push(card);
				continue;
			}*/
			case "lichess.org": ratings = await lichess.org.ratings(username); break;
			//case "chess.com": ratings = await Chess.com.ratings(username); break;
		}
		if (ratings === null || ratings === undefined) return Discord.error(
			"Utente non trovato",
			`Non sono riuscito a trovare l'utente \`${username}\` su ${highlight(platform)}.`
		);
		return ratingCard(interaction.member!.user!.id, username, platform, ratings);
	}
};

function ratingCard(author: string, id: string, platform: string, ratings: Ratings) {
	return Discord.card(
		`Elo di ${platforms[platform]}`,
		`:star: <@${author}> (\`${id}\`) ${highlight(platform)} ratings:\n` +
		Object.entries(ratings).map(
			([category, { rating }]) => `${emojis[category]} **${category}** \`${rating}\``
		).join('** ｜ **'),
		colors[platform]
	);
}
