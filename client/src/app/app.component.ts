import {CdkDrag, CdkDragDrop, CdkDrop, moveItemInArray} from '@angular/cdk/drag-drop';
import {ChangeDetectorRef, Component, QueryList, ViewChildren} from '@angular/core';
import {AngularFirestore} from '@angular/fire/firestore';
import {BoardRow, BoardSquare, Tile} from './shared/models/models';
import * as points from './shared/models/points';
import * as tiles from './shared/models/tiles';
import {BoardStore} from './shared/stores/board_store';
import {GameStore} from './shared/stores/game_store';
import {Observable} from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  @ViewChildren(CdkDrop) dropsQuery!: QueryList<CdkDrop>;

  
  player = this.game.player.select();
  playerTiles = this.game.playerTiles.select();
  currentPlayer = this.game.currentPlayer.select();

  drops: CdkDrop[] = [];
  board: BoardStore;

  constructor(
      private readonly db: AngularFirestore,
      private readonly changeDetector: ChangeDetectorRef,
      readonly game: GameStore) {

    this.game.load('1');
    this.board = this.game.board;
  }

  pickup(tile: Tile) {
    this.game.pickup(tile);
  }

  endTurn() {
    this.game.endTurn();
  }

  ngAfterViewInit () {
    this.updateDrops();
    this.dropsQuery.changes.subscribe(() => this.updateDrops());
  }

  updateDrops() {
    this.drops = this.dropsQuery.toArray();
    this.changeDetector.detectChanges();
  }

  // TODO: this should be in the store so it is persisted.
  dropInTray(event: CdkDragDrop<Tile>) {
    const tile = event.item.data;
    // if (!this.playerTiles.includes(tile)) {
    //   tile.push(tile);
    // }

    //moveItemInArray(this.playerTiles, event.previousIndex, event.currentIndex);
  }

  // takeTiles(amount: number) {
  //   const newTiles = tiles.take(this.tiles, amount);
  //   this.playerTiles.push(...newTiles);
  // }

  dropped(position: BoardSquare, event: CdkDragDrop<Tile>) {
    const tile = event.item.data as Tile;
    this.game.performMove({row: position.row, col: position.col, tile});
    // this.playerTiles = this.playerTiles.filter(t => t !== tile);
    // this.takeTiles(1);
  }

  canTileEnter(position: BoardSquare) {
    return (drag: CdkDrag) => {
      const tile = drag.data as Tile;
      const move = {row: position.row, col: position.col, tile};
      return this.board.isMoveValid(move);
    };
  }

  trackByRow(row: BoardRow): number {
    return row.id;
  }

  trackBySquare(square: BoardSquare) {
    return points.encode(square);
  }
}
