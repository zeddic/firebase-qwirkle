import {Board} from "./board";
import {Point, Move} from "./models";
import * as points from './points';

/**
 * Calculates the score the current user would get given the current
 * board game state, assuming they were to end their turn now.
 */
export function calculateScore(board: Board): number {

  // Edge case: first move and the user placed one block. This is the
  // only situation where someone can get a point for a run of length 1.
  if (board.numTiles() === 1 && board.getPending().length === 1) {
    return 1;
  }

  // Find the tiles the user placed. Expand these horizontally and 
  // vertically into unique 'runs' of tiles, then score them. 

  const runs: Point[][] = [];
  for (const point of board.getPending()) {
    runs.push(expandHorizontal(point, board));
    runs.push(expandVertical(point, board));
  }

  const unique = dedupRuns(runs);
  const values = unique.map(scoreRun);
  const sum = values.reduce((accum, val) => accum + val, 0);

  return sum;
}

/**
 * Score a run of tiles.
 * 1 point per tile (up to 6)
 * 6 bonus points for completing a run of 6
 */
function scoreRun(moves: Point[]) {
  if (moves.length === 1) {
    return 0;
  }

  let score = moves.length;
  if (moves.length === 6) {
    score += 6;
  }

  return score;
}

/**
 * Given a point on the board returns the longest contiguous
 * vertical run of tiles through this point.
 */
function expandVertical(point: Point, board: Board): Move[] {
  const moves: Move[] = [];

  // Find the first tile in the run.
  let pointer = point;
  while (board.hasTile(points.above(pointer))) {
    pointer = points.above(pointer);
  }

  // Add below.
  while (board.hasTile(pointer)) {
    const tile = board.getTile(pointer);
    moves.push({...pointer, tile})
    pointer = points.below(pointer);
  }

  return moves;
}

/**
 * Given a point on the board returns the longest contiguous
 * horizontal run of tiles through this point.
 */
function expandHorizontal(point: Point, board: Board): Move[] {
  const moves: Move[] = [];

  // Find the first tile in the run.
  let pointer = point;
  while (board.hasTile(points.left(pointer))) {
    pointer = points.left(pointer);
  }

  // Add right.
  while (board.hasTile(pointer)) {
    const tile = board.getTile(pointer);
    moves.push({...pointer, tile})
    pointer = points.right(pointer);
  }

  return moves;
}

/**
 * Given a list of runs, returns a new list with duplicates removed.
 */
function dedupRuns(runs: Point[][]): Point[][] {
  const seen = new Set<string>();
  const unique: Point[][] = [];

  for (let run of runs) {
    const key = encodeRun(run);
    if (!seen.has(key)) {
      unique.push(run);
      seen.add(key)
    }
  }

  return unique;
}

/**
 * Encodes a run (a list of positions) into a string.
 */
function encodeRun(run: Point[]) {
  return run.map(p => points.encode(p)).join(';');
}
