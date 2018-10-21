import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {AppComponent} from './app.component';
import {AngularFireModule} from '@angular/fire';
import {AngularFirestoreModule} from '@angular/fire/firestore';
import {environment} from '../environments/environment';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import { DragDropModule } from '@angular/cdk/drag-drop';
import {MatButtonModule} from '@angular/material/button';
import {SharedModule} from './shared/shared.module';
import {GameStore} from './shared/stores/game_store';
import { GameRoomComponent } from './game-room/game-room.component';
import { BrowserComponent } from './browser/browser.component';
import {RoutesModule} from './routes-module';
import {RouterModule} from '@angular/router';

@NgModule({
  declarations: [
    AppComponent,
    GameRoomComponent,
    BrowserComponent,
  ],
  imports: [
    AngularFireModule.initializeApp(environment.firebase),
    AngularFirestoreModule,
    BrowserAnimationsModule,
    BrowserModule,
    DragDropModule,
    FormsModule,
    MatButtonModule,
    RoutesModule,
    RouterModule,
    SharedModule,
  ],
  providers: [GameStore],
  bootstrap: [AppComponent]
})
export class AppModule {}
