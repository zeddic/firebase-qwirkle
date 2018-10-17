
export interface Tile {
  color: number;
  shape: number;
}

export interface Point {
  row: number;
  col: number;
}

export interface Move extends Point {
  tile: Tile;
}

export interface BoardSquare {
  // point: Point
  row: number;
  col: number;
  tile?: Tile;
  pending: boolean;
  valid: boolean;
}

export interface BoardRow {
  cols: BoardSquare[];
  id: number;
}


export interface GameState {
  id?: string;
  doc?: GameDoc;
  held?: Tile;
}



// Document models stored in Firestore


export interface GameDocPlayer {
  name: string;
  tiles: Tile[];
  score: number;
}

export interface GameDocBoard {
  tiles: {[key: string]: Tile};
  pending: Point[];
}

export interface GameDoc {
  board: GameDocBoard;
  bag: Tile[];
  players: GameDocPlayer[];
  currentPlayer: string;
}