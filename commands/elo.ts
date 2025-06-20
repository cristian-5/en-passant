
import { Command, CommandType, CommandOptionType } from "../types/command.ts";
import { Interaction, InteractionResponse } from "../types/interaction.ts";
import { Discord } from "../environment.ts";
import { fide    } from "../core/site/fide.com.ts";
import { lichess } from "../core/site/lichess.org.ts";
import { Chess   } from "../core/site/chess.com.ts";

const colors: { [platform: string]: number } = {
	"fide.com": 0x4e63bb, "lichess.org": 0xFFFFFF, "chess.com": 0x7FA650
};
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
			{ name: "fide.com", value: "fide.com" },
			{ name: "lichess.org", value: "lichess.org" },
			{ name: "chess.com", value: "chess.com" }
		]
	}, {
		description: "Nome utente utilizzato sul sito.",
		name: "username", type: CommandOptionType.STRING, required: true
	}],
	run: async (interaction: Interaction): Promise<InteractionResponse> => {
		const platform = interaction.data.options![0].value! as string;
		const fidename = (interaction.data.options![1].value! as string)
			.replace(/[^a-zA-Z0-9_\- ]/g, "").trim();
		let username = fidename.replace(/\s+/g, "");
		let ratings = null, player = null, title = "", flag = "", profile = "", patron = false;
		switch (platform) {
			case "fide.com":
				player = await fide.com.player(fidename);
				if (player === null) return /^\d+$/.test(fidename) ? Discord.error(
					"Ricerca Elo FIDE",
					`Impossibile trovare l'**ID FIDE** \`${fidename}\`.`
				) : Discord.warn( // could not find FIDE ID for the specified name:
					"Ricerca Elo FIDE",
					`Impossibile trovare l'**ID FIDE** di \`${fidename}\`.`
				);
				username = player.name.split(/\s*,\s*/).reverse().join(" ");
				profile = fide.com.profile(player.id);
				flag = player.flag + " ";
				if (player.title) title = player.title + " ";
				ratings = player.ratings;
			break;
			case "lichess.org":
				player = await lichess.org.player(username);
				if (player === null) break;
				if (player.profile?.flag) flag = player.profile.flag + " ";
				ratings = player.perfs;
				if (player.patron) patron = true;
				if (player.title) title = player.title + " ";
				profile = lichess.org.profile(player.id);
			break;
			case "chess.com":
				player = await Chess.com.player(username);
				if (player === null) break;
				if (player.flag) flag = player.flag + " ";
				if (player.title) title = player.title + " ";
				ratings = await Chess.com.ratings(username);
				profile = player.url;
				if (player.name) username = player.name;
			break;
		}
		return ratings === null ? Discord.error(
			`Utente ${platform} non trovato`,
			`Impossibile trovare l'utente \`${username}\`.`
		) : Discord.embed(
			(patron ? "🪽 " : "") + platform, flag + title + username,
			Object.entries(ratings).filter(([category, _]) => category in emojis).map(
				([c, { rating }]) => `${emojis[c]} **${c}** \`${rating > 0 ? rating : "-"}\``
			).join('** ｜ **'), colors[platform], profile
		);
	}
};
