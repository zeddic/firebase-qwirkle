import {Injectable, Injector} from "@angular/core";
import {AngularFireAuth} from '@angular/fire/auth';
import {AngularFirestore} from "@angular/fire/firestore";
import {auth} from 'firebase/app';
import {Observable, of} from "rxjs";
import {map, switchMap} from "rxjs/operators";
import {Router, ActivatedRoute, RouterStateSnapshot} from "@angular/router";

@Injectable()
export class AuthService {

  private loggedIn: Observable<boolean>;
  public user: Observable<User>;

  constructor(
      private readonly fireAuth: AngularFireAuth,
      private readonly firestore: AngularFirestore,
      private readonly router: Router) {

    this.user = fireAuth.authState.pipe(switchMap(user => {
      return user ? this.getUserDoc(user.uid).valueChanges() : of(null);
    }));

    this.loggedIn = this.user.pipe(map(user => {
      return !!user;
    }))
  }

  isLoggedIn(): Observable<boolean> {
    return this.loggedIn;
  }

  login(): Promise<void> {
    const provider = new auth.GoogleAuthProvider()
    return this.oAuthLogin(provider);
  }

  logout(): Promise<void> {
    return this.fireAuth.auth.signOut()
        .then(() => {
          // Ideally this should just cause the route-guards to re-run, 
          // bug angular doesn't support this yet
          this.router.navigateByUrl('/login');
        });
  }

  private oAuthLogin(provider) {
    return this.fireAuth.auth.signInWithPopup(provider)
        .then(creds => this.updateUserDoc(creds));
  }

  private updateUserDoc(creds: auth.UserCredential) {
    const user = creds.user;
    const userRef = this.getUserDoc(user.uid);

    const userDoc: User = {
      id: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
    }

    userRef.set(userDoc, {merge: true});
  }

  private getUserDoc(uid: string) {
    return this.firestore.doc<User>(`users/${uid}`)
  }
}

export interface User {
  id: string;
  email: string;
  displayName: string;
  photoURL: string;
};