// no-admin.guard.ts
import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class NoAdminGuard implements CanActivate {
  constructor(private router: Router) {}

  canActivate(): boolean {
    const user = window.Clerk?.user;
    const isAdmin = user?.publicMetadata?.['isAdmin'] === true;
    if (user && isAdmin) {
      // Redirigí a home, perfil o donde quieras
      this.router.navigate(['/']);
      return false;
    }
    return true; // Si no es admin (o es anonimo), deja pasar
  }
}
