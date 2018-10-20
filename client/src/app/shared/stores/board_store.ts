import {Board} from "../models/board";
import {BoardRow, BoardSquare, GameState, Move, Point, Tile} from "../models/models";
import * as points from '../models/points';
import {create, Store, StoreValue} from "../store/store";
import {calculateScore} from "../models/scoring";

export class BoardStore {
  private readonly board: StoreValue<Board>;
  public readonly squares: StoreValue<BoardRow[]>;
  public readonly score: StoreValue<number>;
  public readonly numMovesMade: StoreValue<number>;

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
    this.numMovesMade = this.board.map(b => b.getPending().length);
  }

  isMoveValid(move: Move): boolean {
    return this.board.snapshot().isMoveValid(move);
  }
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
