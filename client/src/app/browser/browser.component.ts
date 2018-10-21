import { Component, OnInit } from '@angular/core';
import {AngularFirestore} from '@angular/fire/firestore';
import {GameDoc, GameStage} from '../shared/models/models';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';

@Component({
  selector: 'app-browser',
  templateUrl: './browser.component.html',
  styleUrls: ['./browser.component.scss']
})
export class BrowserComponent {
  games: Observable<GameUiModel[]>;

  constructor(private readonly db: AngularFirestore) {
    // https://github.com/angular/angularfire2/blob/master/docs/firestore/querying-collections.md
    const collection = db.collection<GameDoc>('games');
    
    this.games = collection.snapshotChanges().pipe(map(data => {
      return data.map(value => {
        const doc = value.payload.doc.data();
        const id = value.payload.doc.id;
        return toGameUiModel(id, doc);
      });
    }));
  }
}

function toGameUiModel(id: string, doc: GameDoc): GameUiModel {
  return {
    id,
    numPlayers: doc.players.length,
    stage: doc.stage,
  }
}

export interface GameUiModel {
  id: string;
  numPlayers: number;
  stage: GameStage;

  // TODO: Add these fields:
  // currentUserInGame
  // isCurrentUsersTurn
}
