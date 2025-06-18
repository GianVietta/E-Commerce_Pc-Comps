import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class ClerkAuthGuard implements CanActivate {
  constructor(private router: Router) {}

  canActivate(): boolean {
    if (!!window.Clerk?.user) {
      return true;
    } else {
      this.router.navigate(['/login']);
      return false;
    }
  }
}
