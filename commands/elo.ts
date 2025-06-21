
import { Command, CommandType, CommandOptionType } from "../types/command.ts";
import { Interaction, InteractionResponse } from "../types/interaction.ts";
import { Discord } from "../environment.ts";
import { fide    } from "../core/site/fide.com.ts";
import { lichess } from "../core/site/lichess.org.ts";
import { Chess   } from "../core/site/chess.com.ts";

const colors: { [platform: string]: number } = {
	"fide": 0x4e63bb, "lichess": 0xFFFFFF, "chess": 0x7FA650
};
const emojis: { [platform: string]: string } = {
	"bullet": ":gun:", "rapid": ":stopwatch:",
	"blitz": ":zap:", "standard": ":clock:",
	"classical": ":hourglass:"
};

export const Elo: Command = {
	name: "elo",
	type: CommandType.CHAT_INPUT,
	description: "🎰 Mostra il tuo elo online.",
	options: [{
		description: "📊 Mostra Elo FIDE",
		name: "fide", type: CommandOptionType.SUB_COMMAND,
		options: [{
			description: "FIDE ID o nome dell'utente",
			name: "id", type: CommandOptionType.STRING, required: true
		}]
	}, {
		description: "📉 Mostra Elo su chess.com",
		name: "chess", type: CommandOptionType.SUB_COMMAND,
		options: [{
			description: "Nome utente su chess.com",
			name: "username", type: CommandOptionType.STRING, required: true
		}]
	}, {
		description: "📈 Mostra Elo su lichess.org",
		name: "lichess", type: CommandOptionType.SUB_COMMAND,
		options: [{
			description: "Nome utente su lichess.org",
			name: "username", type: CommandOptionType.STRING, required: true
		}]
	}],
	run: async (interaction: Interaction): Promise<InteractionResponse> => {
		let platform = interaction.data.options![0].name! as string;
		const color = colors[platform];
		const fidename = (interaction.data.options![0].options![0].value! as string)
			.replace(/[^a-zA-Z0-9_\- ]/g, "").trim();
		let username = fidename.replace(/\s+/g, "");
		let ratings = null, player = null, title = "", flag = "", profile = "", patron = false;
		switch (platform) {
			case "fide":
				platform = "FIDE";
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
				if (player.flag) flag = player.flag + " ";
				if (player.title) title = player.title + " ";
				ratings = player.ratings;
			break;
			case "lichess":
				platform = "lichess.org";
				player = await lichess.org.player(username);
				if (player === null) break;
				if (player.profile?.flag) flag = player.profile.flag + " ";
				ratings = player.perfs;
				if (player.patron) patron = true;
				if (player.title) title = player.title + " ";
				profile = lichess.org.profile(player.id);
			break;
			case "chess":
				platform = "chess.com";
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
			flag + title + username,
			Object.entries(ratings).filter(([category, _]) => category in emojis).map(
				([c, { rating }]) => `${emojis[c]} **${c}** \`${rating > 0 ? rating : "-"}\``
			).join('** ｜ **'), color, profile
		);
	}
};

