import {create, Store, StoreValue} from "../store/store";
import {BoardRow, BoardSquare, Move, Point, Tile, GameState} from "../models/models";
import * as points from '../models/points';
import * as moves from '../models/moves';
import {TileMap} from "../models/tile_map";
import {Board} from "../models/board";

export class BoardStore {
  private readonly board: StoreValue<Board>;
  public readonly squares: StoreValue<BoardRow[]>;
  public readonly score: StoreValue<number>;

  constructor(readonly store: Store<GameState>) {
    const boardDoc = store.value(s => s.doc && s.doc.board);
    this.board = boardDoc.map(doc => {
      const tiles = doc && doc.tiles || {}
      const pending = doc && doc.pending || []
      return new Board(tiles, pending);
    });

    const held = store.value(s => s.held);
    this.squares = create(this.board, held, createSquares);
    this.score = create(this.board, calculateScore);
  }

  isMoveValid(move: Move): boolean {
    return this.board.snapshot().isMoveValid(move);
  }
}

function calculateScore(board: Board): number {

  // Edge case: first move and the user placed one block. This is the
  // only situation where someone can get a point for a run of length 1.
  if (board.numTiles() === 1 && board.getPending().length === 1) {
    return 1;
  }

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
 * The minimize size (in every direction from the origin) of the board.
 */
const MIN_BOARD_SIZE = 3;

/**
 * How many extra squares should be kept between the outermost tile and the
 * board edge. This allows the board to 'auto grow' as tiles are palced near
 * the edge.
 */
const EDGE_BUFFER = 1;

/**
 * Creates a ui model representation of all the squares in the board.
 *
 * Params:
 *  - Board: A readonly structure containing information about what tiles are played
 *  - Held: A tile the user is currently 'holding' and is used to annotate squares
 *          that are valid destinations. 
 */
function createSquares(
    board: Board,
    held: Tile|undefined,): BoardRow[] {

  const locs = board.getAllOccupiedPoints();

  const colNums = locs.map(p => p.col);
  const rowNums = locs.map(p => p.row);

  const min = MIN_BOARD_SIZE - EDGE_BUFFER;
  const left = minOf(colNums, -min) - EDGE_BUFFER;
  const right = maxOf(colNums, min) + EDGE_BUFFER;
  const top = minOf(rowNums, -min) - EDGE_BUFFER;
  const bottom = maxOf(rowNums, min) + EDGE_BUFFER;
  
  const rows: Array<BoardRow> = [];

  for (let row = top; row <= bottom; row++) {
    const cols: BoardSquare[] = [];
    for (let col = left; col <= right; col++) {
      const point = {row, col};
      const move = {row, col, tile: held};
      const valid = !!held && board.isMoveValid(move);

      cols.push({
        row,
        col,
        tile: board.getTile(point),
        pending: board.isPending(point),
        valid,
      });
    }

    rows.push({cols, id: row});
  }

  return rows;
}

function minOf(values: number[], initial: number = Number.MAX_VALUE): number {
  return values.reduce((accum, current) => Math.min(accum, current), initial);
}

function maxOf(values: number[], initial: number = Number.MIN_VALUE): number {
  return values.reduce((accum, current) => Math.max(accum, current), initial);
}

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

function encodeRun(run: Point[]) {
  return run.map(p => points.encode(p)).join(';');
}
