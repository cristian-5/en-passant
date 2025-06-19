
export interface LichessCategoryStats {
	games: string;
	rating: number;
	rd?: number;    // rating deviation
	prog?: number;  // progress towards next rating
	prov?: boolean; // provisional rating
}

export interface LichessUser {
	id: string;
	perfs: {
		classical: LichessCategoryStats,
		rapid: LichessCategoryStats,
		blitz: LichessCategoryStats,
		bullet: LichessCategoryStats,
		correspondence?: LichessCategoryStats,
		chess960?: LichessCategoryStats,
		kingOfTheHill?: LichessCategoryStats,
		threeCheck?: LichessCategoryStats,
		antichess?: LichessCategoryStats,
		atomic?: LichessCategoryStats,
		horde?: LichessCategoryStats,
		crazyhouse?: LichessCategoryStats,
		puzzle?: LichessCategoryStats,
	},
	createdAt: number; // timestamp
	profile: {
		flag?: string; // country flag
		links?: string;
	},
	seenAt: number; // timestamp
	count: {
		all: number;
		rated: number;
		ai: number;
		draw: number;
		drawH: number;
		win: number;
		winH: number;
		loss: number;
		lossH: number;
	}
}

export class lichess {

	static org = {

		profile: async (user: string): Promise<LichessUser | null> => {
			user = encodeURIComponent(user);
			const url = "https://lichess.org/api/user/";
			try {
				const response = await fetch(url + user);
				if (response.status != 200) return null;
				return await response.json();
			} catch { return null; }
		},

		ratings: async (user: string) => {
			const profile = await lichess.org.profile(user);
			return profile?.perfs || null;
		},

		/// gets game from lichess.org given its id.
		/// returns null in case of error.
		/// test: curl https://lichess.org/game/export/PFQkvYvy
		/// for json instead of pgn, add: -H 'Accept: application/json'
		game: async (id: string): Promise<string | null> => {
			const API_BASE_URL = "https://lichess.org/game/export/";
			try { return await fetch(API_BASE_URL + id).then(r => r.ok ? r.text() : null); }
			catch (e) { console.error(e); }
			return null;
		},

	}

}
