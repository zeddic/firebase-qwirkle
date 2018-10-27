import {isBoardValid} from './board_validation';
import {Board} from './board';
import {Tile} from './models';

describe('Board Validation Test', () => {
  it('validates a simple board', () => {

    // format:
    // <tile_row>,<tile_col>: <color_id><spape_id>
    // color/shape ids accept 0-6
    // rows and cols may be negative. Center of board is 0,0
    expect(isBoardValid(createBoard({
      '0,0': '00',
      '0,1': '01',
      '0,2': '02',
      '0,3': '03',
    }))).toBe(true);
  });

  it('fails when the same shape is repeated', () => {
    expect(isBoardValid(createBoard({
      '0,0': '00',
      '0,1': '01',
      '0,2': '00',
    }))).toBe(false);
  });
});

function createBoard(data: {[key: string]: string}): Board {
  const tiles: {[key: string]: Tile} = {};

  for (let entry of Object.entries(data)) {
    const key = entry[0];
    const value = entry[0];
    const tile = decodeTile(value);
    tiles[key] = tile;
  }

  return new Board(tiles, []);
}

let tileIdGen = 0;
function decodeTile(tile: string): Tile {
  const color = Number(tile[0]);
  const shape = Number(tile[1]);
  return {color, shape, id: tileIdGen++};
}