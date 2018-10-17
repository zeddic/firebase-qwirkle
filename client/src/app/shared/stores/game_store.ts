import {Injectable} from "@angular/core";
import {AngularFirestore, AngularFirestoreDocument} from "@angular/fire/firestore";
import {Board} from "../models/board";
import {GameDoc, GameDocBoard, GameState, Move, Tile} from "../models/models";
import * as points from '../models/points';
import * as tiles from '../models/tiles';
import {Store} from "../store/store";
import {BoardStore} from "./board_store";

@Injectable()
export class GameStore {
  private doc?: AngularFirestoreDocument<GameDoc>;
  private readonly store = new Store<GameState>({});
  private readonly id = this.store.value(s => s.id);
  private readonly gameDoc = this.store.value(s => s.doc);
  readonly board: BoardStore;

  constructor(private readonly db: AngularFirestore) {
    this.board = new BoardStore(this.store);
  }

  load(id: string) {
    this.store.update(s => s.id = id);

    this.doc = this.db.collection('games').doc('id');
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
    this.store.update(state => {
      state.doc.board.pending = [];
    })
    this.save();
  }

  performMove(move: Move) {
    const key = points.encode(move);
    this.store.update(state => {
      state.doc.board.pending.push(move);
      state.doc.board.tiles[key] = move.tile;
    });
    this.save();
  }

  pickup(tile: Tile) {
    this.store.update(state => state.held= tile);
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

// todo: fill in players
function createGameDoc(): GameDoc {
  const bag = tiles.createSet();

  const board: GameDocBoard = {
    tiles: {},
    pending: [],
  };

  const game = {
    board,
    bag,
    players: [],
    currentPlayer: '',
  };

  return game;
}

