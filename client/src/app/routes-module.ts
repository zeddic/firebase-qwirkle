import {NgModule} from "@angular/core";
import {RouterModule, Routes} from "@angular/router";
import {BrowserComponent} from "./browser/browser.component";
import {GameRoomComponent} from "./game-room/game-room.component";

const APP_ROUTES: Routes = [
  {path: 'browser', component: BrowserComponent},
  {path: 'game/:id', component: GameRoomComponent},
  {
    path: '',
    redirectTo: '/game/1',
    pathMatch: 'full'
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(APP_ROUTES)
  ],
})
export class RoutesModule {}