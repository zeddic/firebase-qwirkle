import {NgModule} from "@angular/core";
import {RouterModule, Routes} from "@angular/router";
import {BrowserComponent} from "./browser/browser.component";
import {GameRoomComponent} from "./game-room/game-room.component";
import {AuthGuard} from "./shared/auth/auth.guard";
import {LoginComponent} from "./login/login.component";

const APP_ROUTES: Routes = [
  {
    path: 'browser',
    component: BrowserComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'game/:id',
    component: GameRoomComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'login',
    component: LoginComponent,
    canActivate: [],
  },
  {
    path: '',
    redirectTo: '/browser',
    pathMatch: 'full'
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(APP_ROUTES)
  ],
})
export class RoutesModule {}