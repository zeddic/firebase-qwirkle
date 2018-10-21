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
  
}
