import { Component, inject, ViewEncapsulation } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router, RouterLink, RouterModule } from '@angular/router';
import { LoginComponent } from '../../auth/component/login/login.component';
import { AuthService } from '../../auth/service/auth.service';
import { User } from '../../auth/interface/auth';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule,RouterModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
  encapsulation: ViewEncapsulation.Emulated
})
export class HeaderComponent {
  readonly dialog = inject(MatDialog);
  authService = inject(AuthService);
  router = inject(Router);
  
  isAuthenticated = false;
  isAdminUser = false;
  isMenuOpen = false;  // Controla la visibilidad del menú desplegable

  user: User | undefined = this.authService.currentUser;

  get getUser(): User | undefined {
    return this.authService.currentUser;
  }

  ngOnInit() {
    this.authService.authStatusChanges().subscribe(isAuthenticated => {
      this.isAuthenticated = isAuthenticated;
      this.isAdminUser = this.getUser?.id === '1'; // Verifica si el usuario es admin
    });
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen; // Cambiar estado del menú
  }

  viewProfile() {
    this.router.navigate(['/profile']); // Redirige a la página de perfil
    this.isMenuOpen = false;  // Cierra el menú después de hacer clic
  }

  logout() {
    this.authService.logout();
    this.isAuthenticated = false;
    this.isAdminUser = false;
    this.isMenuOpen = false;
    this.router.navigate(['']);
      // Cierra el menú después de hacer clic
  }

  login() {
    const dialogRef = this.dialog.open(LoginComponent, {
      disableClose: true,
      autoFocus: true,
      closeOnNavigation: false,
      position: { top: '50px' },
      width: '1000px',
      data: { tipo: 'LOGIN' }
    });

    dialogRef.afterClosed().subscribe(result => {
      this.authService.checkStatusAutentication().subscribe(
        auth => {
          this.isAuthenticated = auth;
      if (this.getUser?.id === '1') {
        this.isAdminUser = true;
      } else {
        this.isAdminUser = false;
      }
        }
      );
    });
  }
}
