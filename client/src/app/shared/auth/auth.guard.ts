import {Injectable} from '@angular/core';
import {CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router} from '@angular/router';
import {AuthService} from './auth.service';
import {Observable} from 'rxjs';
import {tap} from 'rxjs/operators';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
      private authService: AuthService,
      private router: Router)
  {}

  canActivate(
      next: ActivatedRouteSnapshot,
      state: RouterStateSnapshot,
    ): Observable<boolean> | boolean {

    return this.authService.isLoggedIn()
        .pipe(tap(isLoggedIn => {
          if (!isLoggedIn) {
            this.router.navigate(['/login']);
          }
        }));
  }
}