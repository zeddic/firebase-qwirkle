
export interface Tile {
  color: number;
  shape: number;
  id: number;
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
  held?: Tile;
  doc?: GameDoc;
  playerId?: string;
}



// Document models stored in Firestore

export interface GameDoc {
  board: GameDocBoard;
  bag: Tile[];
  players: GameDocPlayer[];
  currentPlayer: string;
  stage: GameStage;
}

export interface GameDocPlayer {
  name: string;
  tiles: Tile[];
  score: number;
}

export interface GameDocBoard {
  tiles: {[key: string]: Tile};
  pending: Point[];
}

export enum GameStage {
  SETUP = 'setup',
  PLAYING = 'playing',
  DONE = 'complete',
}