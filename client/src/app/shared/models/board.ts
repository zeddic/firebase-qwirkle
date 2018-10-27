import {create, Store, StoreValue} from "../store/store";
import {BoardRow, BoardSquare, Move, Point, Tile, GameState} from "./models";
import * as points from './points';
import * as moves from './moves';
import {TileMap} from "./tile_map";
import * as validation from "./board_validation";

export class Board {
  private readonly tileMap: TileMap;
  private readonly pendingSet: Set<string>;

  constructor(
      private readonly tiles: {[key: string]: Tile},
      private readonly pending: Point[]) {
    this.tileMap = new TileMap(tiles);
    this.pendingSet = new Set(pending.map(points.encode));
  }

  numTiles() {
    return this.tileMap.numTiles();
  }

  hasTile(point: Point): boolean {
    return this.tileMap.hasTile(point);
  }

  getTile(point: Point): Tile|undefined {
    return this.tileMap.getTile(point);
  }

  isMoveValid(move: Move): boolean {
    return moves.isMoveValid(move, this);
  }

  isValid(): boolean {
    return validation.isBoardValid(this);
  }

  getPendingMoves(): Move[] {
    return this.pending.map(p => {
      return {tile: this.tileMap.getTile(p), ...p};
    });
  }

  isPending(point: Point): boolean {
    return this.pendingSet.has(points.encode(point));
  }

  getPending(): Point[] {
    return this.pending;
  }

  getAllOccupiedPoints(): Point[] {
    return Object.keys(this.tiles).map(points.decode)
  }
}
