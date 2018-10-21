import {Injectable} from '@angular/core';
import {CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router} from '@angular/router';
import {AuthService} from './auth.service';
import {Observable} from 'rxjs';

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

    console.log('checked!')
      
    if (this.authService.isLoggedIn()) {
      return true;
    }

    console.log('access denied!')
    this.router.navigate(['/login']);
    return false
  }
}