import {Point, Tile} from "./models";
import * as points from "./points";

export class TileMap {
  constructor(private readonly tiles: {[key: string]: Tile}){}

  numTiles() {
    return Object.keys(this.tiles).length;
  }

  hasTile(point: Point): boolean {
    return !!this.getTile(point);
  }

  getTile(point: Point): Tile|undefined {
    return this.tiles[points.encode(point)];
  }
}
