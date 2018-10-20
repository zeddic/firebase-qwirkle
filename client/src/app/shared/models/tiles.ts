/**
 * Utility methods when working with tiles.
 */
import {Tile, Point} from "./models";

/**
 * Creates a new set of tiles for a game.
 */
export function createSet(): Tile[] {
  const tiles: Tile[] = [];
  let ids = 1;
  for (let color = 0; color < 6; color++) {
    for (let shape = 0; shape < 6; shape++) {
      tiles.push({color, shape, id: ids++});
      tiles.push({color, shape, id: ids++});
      tiles.push({color, shape, id: ids++});
    }
  }
  return shuffle(tiles);
}

/**
 * Randomly shuffles tiles. Mutates the original list.
 */
export function shuffle(tiles: Tile[]): Tile[] {
  return tiles.sort(() => Math.random() - Math.random());
}

/**
 * Takes up to a desired amount of tiles from the given list.
 * Mutates the original list.
 */
export function take(from: Tile[], desiredAmount: number): Tile[] {
  const toReturn: Tile[] = [];

  for (let i = 0; i < desiredAmount; i++) {
    const taken = from.pop();
    if (taken) {
      toReturn.push(taken);
    }
  }

  return toReturn;
}

// export function equal(a: Tile, b: Tile) {
//   return a.color === b.color && a.shape && b.shape;
// }