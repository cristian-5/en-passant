
export interface ChessComPlayer {
	player_id: number;
	avatar?: string; // URL to the player's avatar
	"@id": string;
	url: string;
	title?: string;
	username: string;
	followers: number;
	country: string;
	flag?: string;
	last_online: number; // timestamp
	joined: number;      // timestamp
	status: string;
	is_streamer: boolean;
	verified: boolean;
	league: string;
	streaming_platforms: string[];
}

interface RatingInfo {
	rating: number;
	date: number;  // timestamp
	rd?: number;   // only present in "last" entries
	game?: string; // only present in "best" entries
}

interface RecordInfo {
	win: number;
	loss: number;
	draw: number;
}

interface GameTypeStats {
	last: RatingInfo;
	best: RatingInfo;
	record: RecordInfo;
}

interface TacticsStats {
	highest: {
		rating: number;
		date: number;
	};
	lowest: {
		rating: number;
		date: number;
	};
}

interface PuzzleRushStats {
	best: {
		total_attempts: number;
		score: number;
	};
}

export interface ChessComStats {
	chess_rapid: GameTypeStats;
	chess_bullet: GameTypeStats;
	chess_blitz: GameTypeStats;
	tactics: TacticsStats;
	puzzle_rush: PuzzleRushStats;
}

export class Chess {

	static com = {

		profile: (user: string): string => "https://www.chess.com/member/" + user,

		player: async (user: string): Promise<ChessComPlayer | null> => {
			user = encodeURIComponent(user);
			const url = "https://api.chess.com/pub/player/";
			try {
				const response = await fetch(url + user);
				if (response.status !== 200) return null;
				const data = await response.json();
				if (data.country) {
					data.country = data.country.substring(data.country.length - 2).toUpperCase();
					data.flag = String.fromCodePoint(
						data.country.charCodeAt(0) + 127397,
						data.country.charCodeAt(1) + 127397
					);
				}
				return data as ChessComPlayer;
			} catch { return null; }
		},

		stats: async (user: string): Promise<ChessComStats| null> => {
			user = encodeURIComponent(user);
			const url = `https://api.chess.com/pub/player/${user}/stats`;
			try {
				const response = await fetch(url);
				if (response.status !== 200) return null;
				return await response.json();
			} catch { return null; }
		},

		ratings: async (user: string) => {
			const chess_com = await Chess.com.stats(user);
			if (chess_com === null) return null;
			return {
				bullet: { rating: chess_com?.chess_bullet?.last?.rating || 0 },
				blitz: { rating: chess_com?.chess_blitz?.last?.rating || 0 },
				rapid: { rating: chess_com?.chess_rapid?.last?.rating || 0 },
			};
		},

		/*best: async (user: string) => {
			const categories = [ 'rapid', 'blitz', 'bullet' ];
			const ratings = [];
			const chess_com = await Chess.com.stats(user);
			if (chess_com == null) return undefined;
			for (const category of categories) {
				const key = "chess_" + category;
				if (chess_com[key] == undefined ||
					chess_com[key].best == undefined ||
					chess_com[key].best.rating == undefined) continue;
				const rating = { category, rating: "unrated" };
				if (!isNaN(parseInt(chess_com[key].best.rating)))
					rating.rating = chess_com[key].best.rating;
				ratings.push(rating);
			}
			return ratings;
		},*/

		exists: async (user: string) => {
			user = encodeURIComponent(user);
			const url = `https://api.chess.com/pub/player/${user}/stats`;
			try {
				const response = await fetch(url);
				return (response.status === 200);
			} catch { return false; }
		},

		/// gets daily game from chess.com given its
		/// id returns undefined in case of error.
		daily: async (id: string) => {
			const API_BASE_URL = "https://www.chess.com/callback/daily/game/";
			let g = null;
			try {
				g = await fetch(API_BASE_URL + id).then(
					r => r.status === 200 ? r.json() : null
				);
			} catch { return null; }
			if (g === null) return null;
			g.game.moveList = moves(g.game.moveList);
			return g.game;
		},

		/// gets live game from chess.com given its
		/// id returns undefined in case of error.
		live: async (id: string) => {
			const API_BASE_URL = "https://www.chess.com/callback/live/game/";
			let g = null;
			try {
				g = await fetch(API_BASE_URL + id).then(
					r => r.status == 200 ? r.json() : null
				);
			} catch { return null; }
			if (g === null) return null;
			g.game.moveList = moves(g.game.moveList);
			return g.game;
		}

	};

}

// MOVES:

// https://github.com/andyruwruw/chess-web-api/issues/10#issuecomment-779735204
const S = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!?";
const FILES = "abcdefgh";

// https://github.com/andyruwruw/chess-web-api/issues/11#issuecomment-783687021
const PROMOTIONS = "#@$_[]^()~{}", PIECES = "brnq";

/// decodes a move into algebraic notation or pawn promotion.
/// - move: string of two characters.
function decode(move: string) {
	let index = S.indexOf(move[0]);
	const f1 = FILES[index % 8], r1 = Math.floor(index / 8) + 1;
	index = S.indexOf(move[1]);
	let p, f2, r2;
	if (index == -1) {
		index = PROMOTIONS.indexOf(move[1]);
		p = PIECES[Math.floor(index / 3)];
		f2 = FILES.indexOf(f1);
		const l = index % 3 == 1, r = index % 3 == 2;
		if (l) f2--; else if (r) f2++; // capture left or right
		f2 = FILES[f2];
		if (r1 == 2) r2 = 1; else r2 = 8;
	} else { f2 = FILES[index % 8]; r2 = Math.floor(index / 8) + 1; }
	return { from: `${f1}${r1}`, to: `${f2}${r2}`, promotion: p };
}

/// decodes a list of moves from a string.
function moves(m: string) {
	const list = [];
	for (let i = 0; i < m.length; i += 2) {
		const move = decode(m.substring(i, i + 2));
		list.push(move);
	}
	return list;
}
