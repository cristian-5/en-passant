
import { Image } from "https://deno.land/x/imagescript@1.2.15/mod.ts";

import { PIECES_50 } from "./pieces.ts";

type Piece = "k" | "q" | "r" | "b" | "n" | "p";
export type Color = "w" | "b";
type Board =  ({ type: string, color: Color } | null)[][];
const THEME = { light: 0xffce9eff, dark: 0xd18b47ff, highlight: 0x0fa42e4d };
const FILES = "abcdefgh", SIDE = 50, SIZE = SIDE * 8;
const PIECES: { [color: string]: { [piece: string]: Image }; }= {
	'w': {
		'p': await Image.decode(PIECES_50["w"]["p"]),
		'n': await Image.decode(PIECES_50["w"]["n"]),
		'b': await Image.decode(PIECES_50["w"]["b"]),
		'r': await Image.decode(PIECES_50["w"]["r"]),
		'q': await Image.decode(PIECES_50["w"]["q"]),
		'k': await Image.decode(PIECES_50["w"]["k"])
	},
	'b': {
		'p': await Image.decode(PIECES_50["b"]["p"]),
		'n': await Image.decode(PIECES_50["b"]["n"]),
		'b': await Image.decode(PIECES_50["b"]["b"]),
		'r': await Image.decode(PIECES_50["b"]["r"]),
		'q': await Image.decode(PIECES_50["b"]["q"]),
		'k': await Image.decode(PIECES_50["b"]["k"])
	}
};

export class Position {

	squares: { [square: string]: { piece: Piece, color: Color } | null } = { };
	highlights: string[] = [];

	constructor(board?: Board) {
		for (let i = "a"; i <= "h"; i = FILES[FILES.indexOf(i) + 1])
			for (let j = 1; j <= 8; j++) this.squares[`${i}${j}`] = null;
		if (board) this.set(board);
	}

	place(piece: Piece, color: Color, square: string) {
		if (square.length !== 2) return this;
		if (square[0] < "a" || square[0] > "h") return this;
		if (square[1] < "1" || square[1] > "8") return this;
		this.squares[square] = { piece, color };
		return this;
	}

	set(board: ({ type: string, color: Color } | null)[][]) {
		if (board.length != 8) { this.clear(); return this; }
		for (let i = 0; i < 8; i++) {
			if (board[i].length != 8) { this.clear(); return this; }
			for (let j = 0; j < 8; j++) {
				const square = FILES[j] + (8 - i);
				if (board[i][j] == null) {
					this.squares[square] = null;
					continue;
				}
				const { type, color } = board[i][j]!;
				this.squares[square] = { piece: type as Piece, color };
			}
		}
		return this;
	}

	remove(square: string) {
		if (square.length !== 2) return this;
		if (square[0] < "a" || square[0] > "h") return this;
		if (square[1] < "1" || square[1] > "8") return this;
		this.squares[square] = null;
		return this;
	}

	clear() {
		for (let i = "a"; i <= "h"; i = FILES[FILES.indexOf(i) + 1])
			for (let j = 1; j <= 8; j++) this.squares[`${i}${j}`] = null;
		return this;
	}

	highlight(square: string) {
		if (square.length !== 2) return this;
		if (square[0] < "a" || square[0] > "h") return this;
		if (square[1] < "1" || square[1] > "8") return this;
		this.highlights.push(square);
		return this;
	}

	async picture(perspective: Color = "w") {
		const img = new Image(SIZE, SIZE);
		img.fill(THEME.light);

		for (const f of FILES)
			for (let r = 1; r <= 8; r++)
				if ((FILES.indexOf(f) + r) % 2 == 0)
					img.drawBox(
						FILES.indexOf(f) * SIDE,
						(8 - r) * SIDE,
						SIDE,
						SIDE,
						THEME.dark
					);

		for (const square of this.highlights) {
			let [f, r] = [square[0], Number(square[1])];
			let [x, y] = this.#coords(f, r, perspective);
			img.drawBox(x, y, SIDE, SIDE, THEME.highlight);
		}

		for (const [square, pieceData] of Object.entries(this.squares)) {
			if (!pieceData) continue;
			const [f, r] = [square[0], Number(square[1])];
			const { piece, color } = pieceData;
			const sprite = PIECES[color][piece];
			let [x, y] = this.#coords(f, r, perspective);
			img.composite(sprite.resize(SIDE, SIDE), x, y);
		}

		return await img.encode(5); // compression level 5
	}

	#coords(f: string, r: number, perspective: Color) {
		return perspective === "w" ?
			[FILES.indexOf(f) * SIDE, (8 - r) * SIDE] :
			[(7 - FILES.indexOf(f)) * SIDE, (r - 1) * SIDE];
	}

}

export class Positions {
	#boards: Board[] = [];
	#highlights: string[][] = [];
	#perspective: Color;

	constructor(perspective: Color = "w") {
		this.#perspective = perspective;
	}

	add(board: Board, highlight: string[] = []) {
		this.#boards.push(board);
		this.#highlights.push(highlight);
	}

	/*async gif(delay = 800): Promise<Uint8Array | null> {
		const frames: Image[] = [];

		for (let i = 0; i < this.#boards.length; i++) {
			const pos = new Position(this.#boards[i]);
			for (const h of this.#highlights[i]) pos.highlight(h);
			const frameData = await pos.picture(this.#perspective);
			frames.push(await Image.decode(frameData));
		}

		if (frames.length === 0) return null;

		return await Image.gifEncode(frames, delay);
	}*/

}
