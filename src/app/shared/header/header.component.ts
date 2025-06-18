import { Component, inject, ViewEncapsulation } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router, RouterLink, RouterModule } from '@angular/router';
import { LoginComponent } from '../../auth/component/login/login.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CartService } from '../../cart/service/cart.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
  encapsulation: ViewEncapsulation.Emulated,
})
export class HeaderComponent {
  readonly dialog = inject(MatDialog);
  cartService = inject(CartService);
  private cartSync = false; // Flag para no sincronizar varias veces
  router = inject(Router);
  searchQuery: string = '';

  isAuthenticated = false;
  isAdminUser = false;
  isMenuOpen = false; // Controla la visibilidad del menú desplegable

  ngOnInit() {
    //Clerk actualiza la sesion al cargar
    this.updateSessionState();

    //Para que la UI cambie automaticamente cuando el usuario inicia/cierra sesion
    //escucho los eventos de Clerk
    window.Clerk?.addListener?.((event: any) => {
      if (event.type === 'userChanged' || event.type === 'sessionChanged') {
        this.updateSessionState();
      }
    });
  }

  updateSessionState() {
    const user = window.Clerk?.user;
    this.isAuthenticated = !!user;
    //Lee el campo de admin como metadata dinamico:
    this.isAdminUser = user?.publicMetadata?.['isAdmin'] === true;

    // Si el user acaba de loguearse y no se sincronizo el carrito
    if (this.isAuthenticated && !this.cartSync) {
      const clerk_user_id = user?.id;
      if (clerk_user_id) {
        this.cartService.syncCartWithBackend(clerk_user_id).subscribe({
          next: (res) => {
            console.log('Carrito sincronizado: ', res);
          },
          error: (e) => {
            console.error('Error al sincronizar el carrito: ', e);
          },
        });
      }
      this.cartSync = true;
    }
    // Si el user se desloguea, reseteo el flag
    if (!this.isAuthenticated) this.cartSync = false;
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen; // Cambiar estado del menú
  }

  viewProfile() {
    this.router.navigate(['/profile']); // Redirige a la página de perfil
    this.isMenuOpen = false; // Cierra el menú después de hacer clic
  }

  inicio() {
    this.router.navigate(['']);
  }

  newProduct() {
    this.router.navigate(['/new-product']);
  }

  cart() {
    this.router.navigate(['/cart']);
  }

  logout() {
    window.Clerk?.signOut().then(() => {
      this.isAuthenticated = false;
      this.isAdminUser = false;
      this.isMenuOpen = false;
      this.router.navigate(['']);
    });
    // Cierra el menú después de hacer clic

    // Si el user se desloguea, reseteo el flag
    if (!this.isAuthenticated) this.cartSync = false;
  }

  isLoggedIn(): boolean {
    return !!window.Clerk?.user;
  }

  goToLogin() {
    this.dialog.open(LoginComponent, {
      disableClose: true,
      autoFocus: false,
      closeOnNavigation: false,
      position: { top: '50px' },
      width: '400px', // Más chico porque Clerk es compacto
      panelClass: 'custom-dialog-container',
      data: { tipo: 'LOGIN' },
    });
  }

  onSearch() {
    if (this.searchQuery.trim()) {
      this.router.navigate(['/search-results'], {
        queryParams: { query: this.searchQuery },
      });
    }
  }
}
