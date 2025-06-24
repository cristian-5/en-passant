
import { Image } from "jsr:@matmen/imagescript";
import { GIFEncoder, quantize, applyPalette } from "https://unpkg.com/gifenc@1.0.3/dist/gifenc.esm.js";

import { BACKGROUND_400, PIECES_50 } from "./pieces.ts";

export type Color = "w" | "b";
type Piece = "k" | "q" | "r" | "b" | "n" | "p";
type Board =  ({ type: string, color: Color } | null)[][];

const FILES = "abcdefgh", SIDE = 50, SIZE = SIDE * 8;
const BACKGROUND: { [color: string]: Image } = {
	'w': await Image.decode(BACKGROUND_400["w"]),
	'b': await Image.decode(BACKGROUND_400["b"])
}, PIECES: { [color: string]: { [piece: string]: Image }; } = {
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

	async picture(perspective: Color = "w") {
		const img = new Image(SIZE, SIZE);
		img.composite(BACKGROUND[perspective], 1, 1);

		for (const [square, pieceData] of Object.entries(this.squares)) {
			if (!pieceData) continue;
			const [f, r] = [square[0], Number(square[1])];
			const { piece, color } = pieceData;
			const sprite = PIECES[color][piece];
			let [x, y] = this.#coords(f, r, perspective);
			img.composite(sprite.resize(SIDE, SIDE), x, y);
		}

		return await img.encode(5); // compression level 5 / 9
	}

	#coords(f: string, r: number, perspective: Color) {
		return perspective === "w" ?
			[FILES.indexOf(f) * SIDE, (8 - r) * SIDE] :
			[(7 - FILES.indexOf(f)) * SIDE, (r - 1) * SIDE];
	}

}

export class Positions {
	#boards: Board[] = [];
	#perspective: Color;

	constructor(perspective: Color = "w") {
		this.#perspective = perspective;
	}

	append(board: Board) {
		this.#boards.push(board);
	}
	prepend(board: Board) {
		this.#boards.unshift(board);
	}

	#frames() {
		const frames = []; let i = 0;
		for (const board of this.#boards) {
			const frame = new Image(SIZE, SIZE);
			frame.composite(BACKGROUND[this.#perspective], 0, 0);
			for (const f of FILES) {
				for (let r = 8; r >= 1; r--) {
					let x = 0, y = 0;
					if (this.#perspective === "w") {
						x = SIDE * FILES.indexOf(f);
						y = SIDE * (8 - r);
					} else {
						x = SIDE * (7 - FILES.indexOf(f));
						y = SIDE * (r - 1);
					}
					// place pieces:
					const square = board[8 - r][FILES.indexOf(f)];
					if (square === null) continue;
					const { type, color } = square!;
					frame.composite(PIECES[color][type], x, y);
				}
			}
			frames.push(frame);
		}
		return frames;
	}

	async gif(delay = 800): Promise<Uint8Array | null> {
		const frames = this.#frames();
		const encoder = GIFEncoder();
		if (frames.length === 0) return null;
		for (const frame of frames) {
			const data = frame.bitmap;
			const palette = quantize(data, 24, { format: "rgb444" });
			const index = applyPalette(data, palette, "rgb444");
			encoder.writeFrame(index, SIZE, SIZE, {
				delay, palette, repeat: -1
			});
		}
		encoder.finish();
		return encoder.bytes();
	}

}
