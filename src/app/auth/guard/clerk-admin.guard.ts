import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class ClerkAdminGuard implements CanActivate {
  constructor(private router: Router) {}

  canActivate(): boolean {
    const user = window.Clerk?.user;
    const isAdmin = user?.publicMetadata?.['isAdmin'] === true;
    if (user && isAdmin) {
      return true;
    } else {
      this.router.navigate(['/']);
      return false;
    }
  }
}
