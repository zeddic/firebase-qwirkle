import { Component, OnInit } from '@angular/core';
import {AuthService} from '../shared/auth/auth.service';
import {Router} from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent{

  isLoggedIn = this.authService.isLoggedIn();

  constructor(
    readonly authService: AuthService,
    readonly router: Router,
    ) {
  }

  login() {
    this.authService.login().then(result => {
      this.router.navigate(['/browser']);
    });
  }

  logout() {
    this.authService.logout();
  }
}
