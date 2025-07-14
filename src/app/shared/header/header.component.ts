import {
  Component,
  HostListener,
  inject,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router, RouterModule } from '@angular/router';
import { LoginComponent } from '../../auth/component/login/login.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CartService } from '../../cart/service/cart.service';
import { ProductService } from '../../product/service/product.service';
import {
  catchError,
  debounceTime,
  distinctUntilChanged,
  of,
  Subject,
  Subscription,
  switchMap,
} from 'rxjs';

import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenav, MatSidenavModule } from '@angular/material/sidenav';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    MatToolbarModule,
    MatSidenavModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
  encapsulation: ViewEncapsulation.Emulated,
})
export class HeaderComponent {
  isMobile = false;
  showMobileSearch = false;

  readonly dialog = inject(MatDialog);
  cartService = inject(CartService);
  private cartSync = false; // Flag para no sincronizar varias veces
  router = inject(Router);
  searchQuery: string = '';
  productService = inject(ProductService);

  suggestion: any[] = [];
  showSuggestions = false;
  private searchSubject = new Subject<string>();
  private searchSub: Subscription | undefined;

  isAuthenticated = false;
  isAdminUser = false;
  isMenuOpen = false; // Controla la visibilidad del menú desplegable
  pendingLoginDialog = false;

  ngOnInit() {
    this.onResize();
    window.addEventListener('resize', this.onResize.bind(this));

    //Clerk actualiza la sesion al cargar
    this.updateSessionState();

    //Para que la UI cambie automaticamente cuando el usuario inicia/cierra sesion
    //escucho los eventos de Clerk
    window.Clerk?.addListener?.((event: any) => {
      if (event.type === 'userChanged' || event.type === 'sessionChanged') {
        this.updateSessionState();
      }
    });

    // ----> NUEVO: Observer para sugerencias
    this.searchSub = this.searchSubject
      .pipe(
        debounceTime(250),
        distinctUntilChanged(),
        switchMap((query: string) =>
          query.length > 1
            ? this.productService
                .searchProducts(query)
                .pipe(catchError(() => of([])))
            : of([])
        )
      )
      .subscribe((results: any[]) => {
        this.suggestion = results;
        this.showSuggestions = results.length > 0;
      });
  }

  @HostListener('window:resize')
  onResize() {
    this.isMobile = window.innerWidth <= 768;
    if (!this.isMobile) this.showMobileSearch = false;
  }

  onSearchInput(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.searchSubject.next(value);
  }

  onSelectSuggestion(product: any) {
    this.router.navigate(['/product', product.id]);
    this.clearSuggestions();
    this.showMobileSearch = false;
  }

  clearSuggestions() {
    this.suggestion = [];
    this.showSuggestions = false;
  }

  delayClearSuggestions() {
    setTimeout(() => this.clearSuggestions(), 200);
  }

  onSearch() {
    if (this.searchQuery.trim()) {
      this.router.navigate(['/search-results'], {
        queryParams: { query: this.searchQuery },
      });
    }
    this.clearSuggestions();
  }

  ngOnDestroy() {
    window.removeEventListener('resize', this.onResize.bind(this));
    this.searchSub?.unsubscribe();
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
  @ViewChild('sidenav') sidenav!: MatSidenav;

  openLoginFromSideNav() {
    if (this.sidenav.opened) {
      // 1. Cerrar el sidenav
      this.sidenav.close();
      this.pendingLoginDialog = true;
    } else {
      // Si esta por x razon cerrado el sidenav, abro directamente el login
      this.openLoginDialog();
    }
  }

  onSidenavClosed() {
    if (this.pendingLoginDialog) {
      this.pendingLoginDialog = false;
      this.openLoginDialog();
    }
  }

  openLoginDialog() {
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
}
