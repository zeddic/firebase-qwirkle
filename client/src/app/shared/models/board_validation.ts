import {Board} from "./board";
import {Tile, Point, Move} from "./models";
import * as tiles from "./tiles";
import * as points from "./points";
import * as moves from "./moves";

export function isBoardValid(board: Board): boolean {
  // The board class can answer questions about the board state:
  board.hasTile({row: 0, col: 0}); 
  board.getTile({row: 0, col: 0});

  // For example, you could get a list of all tiles:
  const moves: Move[] = board.getAllMoves();

  // points is a utility package for getting other positions.
  // it accepts points or moves
  const above = points.above({row: 0, col: 0});

  // See moves.ts for examples of all incremental validation is done
  // You may also be able to re-use some of the functions.
  return false;
}
