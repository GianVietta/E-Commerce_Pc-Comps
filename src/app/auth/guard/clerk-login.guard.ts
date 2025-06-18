import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class ClerkLoginGuard implements CanActivate {
  constructor(private router: Router) {}

  canActivate(): boolean {
    if (!!window.Clerk?.user) {
      this.router.navigate(['/']);
      return false;
    }
    return true;
  }
}
