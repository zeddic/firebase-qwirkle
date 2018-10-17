
import * as points from './points';
import {Move, Tile, Point} from './models';
import {Board} from './board';

/**
 * Returns true if the proposed tile placement is valid given the current board state. 
 */
export function isMoveValid(
    move: Move,
    board: Board): boolean {

  if (board.hasTile(move)) {
    return false;
  }

  // must be connected to smoething else (if not first turn)
  if (board.numTiles() > 0) {
    const neighbors = points.neighbors(move);
    const anyNeighborsHasTile = neighbors
        .map(p => board.hasTile(p))
        .some(hasTile => hasTile);

    if (!anyNeighborsHasTile) {
      return false;
    }
  }

  // all moves this turn are in a connected row or column (exclusive or)
  // const pendingMoves = getPendingMoves(tiles, pending);
  const allMoves = [... board.getPendingMoves(), move];
  if (allMoves.length > 1) {
    const sameRow = shareSameRow(allMoves);
    const sameCol = shareSameCol(allMoves);
    const validDir = sameRow ? !sameCol : sameCol; // xor
    if (!validDir) {
      return false;
    }
  }

  // must not make something it is connected to invalid
  const rowTiles = expandRowTiles(move, board);
  const colTiles = expandColTiles(move, board);

  return meetsRules(rowTiles) 
      && meetsRules(colTiles);
}

function meetsRules(tiles: Tile[]): boolean {
  if (tiles.length <= 0) {
    return false;
  }

  const colors = new Set(tiles.map(t => t.color));
  const shapes = new Set(tiles.map(t => t.shape));

  return (colors.size === 1 && shapes.size === tiles.length)
      || (shapes.size === 1 && colors.size === tiles.length);
}


function expandColTiles(move: Move, board: Board): Tile[] {
  const tiles: Tile[] = [];

  // Add above.
  let pointer = points.above(move);
  while (board.hasTile(pointer)) {
    tiles.unshift(board.getTile(pointer));
    pointer = points.above(pointer);
  }

  // Add tile.
  tiles.push(move.tile);

  // Add below.
  pointer = points.below(move);
  while (board.hasTile(pointer)) {
    tiles.push(board.getTile(pointer));
    pointer = points.below(pointer);
  }

  return tiles;
}

function expandRowTiles(move: Move, board: Board): Tile[] {
  const tiles: Tile[] = [];

  // Add left.
  let pointer = points.left(move);
  while (board.hasTile(pointer)) {
    tiles.unshift(board.getTile(pointer));
    pointer = points.left(pointer);
  }

  // Add tile.
  tiles.push(move.tile);

  // Add right.
  pointer = points.right(move);
  while (board.hasTile(pointer)) {
    tiles.push(board.getTile(pointer));
    pointer = points.right(pointer);
  }

  return tiles;
}

function shareSameRow(positions: Point[]): boolean {
  const seen = new Set(positions.map(p => p.row));
  return seen.size <= 1;
}

function shareSameCol(positions: Point[]): boolean {
  const seen = new Set(positions.map(p => p.col));
  return seen.size <= 1;
}
