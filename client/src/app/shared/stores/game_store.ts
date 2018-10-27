import {Injectable} from "@angular/core";
import {AngularFirestore, AngularFirestoreDocument} from "@angular/fire/firestore";
import {GameDoc, GameDocBoard, GameStage, GameState, Move, Tile, GameDocPlayer} from "../models/models";
import * as points from '../models/points';
import * as tiles from '../models/tiles';
import {Store, StoreValue, create} from "../store/store";
import {BoardStore} from "./board_store";

/**
 * The maximum number of tiles players normally have.
 */
const NUM_PLAYER_TILES = 6;

/**
 * A reactive store containing the current state of the game in the client.
 * 
 * It provides methods to modify state (eg endTurn, placeTile), as well
 * as provides public 'StoreValue' properties which may be observed
 * to monitor the state of the game.
 * 
 * This GameState connects and syncs with Firestore where a copy of the 
 * 'game document' is kept. This document contains a subset of the overall
 * GameState and is considered the source of truth for the state of the
 * game (whose turn it is, what tiles have been played, etc). A copy of
 * this game document is kept in the store where it is automatically updated
 * as firestore publishes updates.
 * 
 * What is the difference between GameState and the GameDoc?
 * 
 * - The game state contains the state of the client application, of which
 *   the game document is one part. The client application may have
 *   other local information not worth storing in firebase because it is
 *   unique to the current session (eg, the id of the current player signed
 *   in to this session)
 * 
 * - The game document is the shared game inforomation that needs to be captured
 *   and persisted. It is shared among all players of the game.
 */
@Injectable()
export class GameStore {
  private doc?: AngularFirestoreDocument<GameDoc>;
  private readonly store = new Store<GameState>({
    playerId: '1',
  });
  private readonly id = this.store.value(s => s.id);
  private readonly gameDoc = this.store.value(s => s.doc);

  /**
   * The state of the board.
   */
  readonly board: BoardStore;

  /**
   * The player using this application.
   */
  readonly player: StoreValue<GameDocPlayer>;

  /**
   * The players tiles that they can play.
   */
  readonly playerTiles: StoreValue<Tile[]>;

  /**
   * The player whose turn it currently is.
   */
  readonly currentPlayer: StoreValue<GameDocPlayer>;

  /**
   * True if the game doc has been loaded / initialized.
   */
  readonly loaded: StoreValue<boolean>;

  constructor(private readonly db: AngularFirestore) {

    const doc = this.store.value(s => s.doc);
    this.loaded = doc.map(doc => !!doc);
    this.board = new BoardStore(this.store);

    this.player = create(this.store, (state) => {
      return (state.doc && state.playerId) ?
        findPlayer(state.doc, state.playerId) : undefined;
    });

    this.playerTiles = this.player.map(player => {
      return player && player.tiles || [];
    });

    this.currentPlayer = create(this.store, (state) => {
      return state.doc && getCurrentPlayer(state.doc) || undefined;
    });
  }

  /**
   * Loads the specified game using a firestore id.
   * If it doesn't exist, creates a new entry with initial state.
   */
  load(id: string) {
    this.store.update(s => s.id = id);

    this.doc = this.db.collection('games').doc(id);
    this.doc.ref.get().then(snap => {
      if (!snap.exists) {
        this.doc.set(createGameDoc());
      }
    });

    this.doc.valueChanges().subscribe(doc => {
      this.store.update(s => s.doc = doc);
    });
  }

  endTurn() {
    // TODO: move this to a cloud function. Clients shouldn't be trusted
    // to calculate their score or pickup tiles.

    const numMoves = this.board.numMovesMade.snapshot();
    const score = this.board.score.snapshot();

    this.store.update(state => {
      const doc = state.doc!;
      const board = doc.board!;
      const player = getCurrentPlayer(doc!);
      const playerTiles = player.tiles;

      if (numMoves > 0) {
        // Case: User was able to play at least one tile.
        // Score their points and draw some new tiles.
        const numTilesToTake = NUM_PLAYER_TILES - playerTiles.length;
        const newTiles = tiles.take(doc.bag, numTilesToTake);
        player.score += score;
        player.tiles.push(...newTiles);
      } else {
        // Case: User was unable or did not want to make a play.
        // Put their tiles back in the bag and draw new ones.
        doc.bag.push(...player.tiles);
        tiles.shuffle(doc.bag);
        player.tiles = tiles.take(doc.bag, NUM_PLAYER_TILES);
      }

      // Move to the next player.
      board.pending = [];
      doc.currentPlayer = getNextPlayer(doc).name;

      // TODO: detect if the game is over
    })
    this.save();
  }

  /**
   * Places a tile from the users hand onto the board. This tile is
   * marked as 'pending' on the board until the player ends their turn.
   */
  performMove(move: Move) {
    // Prevent invalid moves.
    if (!this.board.isMoveValid(move)) {
      return;
    }

    // Prevent the user playing a tile they don't have.
    const tiles = this.currentPlayer.snapshot().tiles;
    const playerHasTile = tiles.findIndex(t => t.id === move.tile.id) >= 0;
    if (!playerHasTile) {
      return;
    }

    // Play the move. Takes the tile from their personal supply and
    // puts it on the board as a pending / proposed move.
    const key = points.encode(move);
    this.store.update(state => {
      const player = getCurrentPlayer(state.doc);
      player.tiles = player.tiles.filter(t => t.id !== move.tile.id);
      state.doc.board.pending.push(move);
      state.doc.board.tiles[key] = move.tile;
    });
    this.save();
  }

  /**
   * Has the player 'pickup' a tile from thier tile supply. While held, valid
   * moves will be highlighted.
   */
  pickup(tile: Tile) {
    this.store.update(state => state.held = tile);
  }

  reset() {
    this.doc.set(createGameDoc());
  }

  private save() {
    const id = this.id.snapshot();
    if (!id) {
      return;
    }

    this.doc.set(this.gameDoc.snapshot());
  }
}

// UTILITY FUNCTIONS

function createGameDoc(): GameDoc {
  const bag = tiles.createSet();

  const board: GameDocBoard = {
    tiles: {},
    pending: [],
  };

  const player = createPlayerEntry();
  player.tiles = tiles.take(bag, NUM_PLAYER_TILES);

  const game: GameDoc = {
    board,
    bag,
    players: [
      player,
    ],
    currentPlayer: '1',
    stage: GameStage.PLAYING,
  };

  return game;
}

function createPlayerEntry(): GameDocPlayer {
  return {
    name: '1',
    tiles: [],
    score: 0,
  };
}

function getCurrentPlayer(doc: GameDoc): GameDocPlayer {
  return doc.players.find(p => p.name === doc.currentPlayer);
}

function getNextPlayer(doc: GameDoc): GameDocPlayer {
  const idx = doc.players.findIndex(p => p.name === doc.currentPlayer);
  const next = (idx + 1) % doc.players.length;
  return doc.players[next];
}

function findPlayer(doc: GameDoc, id: string): GameDocPlayer {
  return doc.players.find(p => p.name === id);
}
