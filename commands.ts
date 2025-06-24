
import { Ping } from "./commands/ping.ts";
import { Elo } from "./commands/elo.ts";
import { FEN } from "./commands/fen.ts";
import { PGN } from "./commands/pgn.ts";

export const COMMANDS = [ Ping, Elo, FEN, PGN ];
