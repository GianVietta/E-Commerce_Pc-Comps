import { Routes } from '@angular/router';
import { HomePageComponent } from './product/page/home-page/home-page.component';
import { DetailsProductComponent } from './product/component/details-product/details-product.component';
import { NewProductPageComponent } from './product/page/new-product-page/new-product-page.component';
import { UpdateProductComponent } from './product/component/update-product/update-product.component';
import { CartPageComponent } from './cart/page/cart-page/cart-page.component';
import { SalesPageComponent } from './sales/page/sales/sales-page.component';
import { AuthPageComponent } from './auth/page/auth-page/auth-page.component';
import { SerchProductComponent } from './product/component/serch-product/serch-product.component';
import { LoginComponent } from './auth/component/login/login.component';
import { ClerkAuthGuard } from './auth/guard/clerk-auth.guard';
import { ClerkAdminGuard } from './auth/guard/clerk-admin.guard';
import { ClerkLoginGuard } from './auth/guard/clerk-login.guard';

export const routes: Routes = [
  { path: '', component: HomePageComponent },
  {
    path: 'profile',
    component: AuthPageComponent,
    canActivate: [ClerkAuthGuard],
  },
  { path: 'product/:id', component: DetailsProductComponent },
  { path: 'update-product/:id', component: UpdateProductComponent },
  {
    path: 'new-product',
    component: NewProductPageComponent,
    canActivate: [ClerkAdminGuard],
  },
  { path: 'cart', component: CartPageComponent },
  { path: 'sales-page', component: SalesPageComponent },
  { path: 'search-results', component: SerchProductComponent },
  { path: 'login', component: LoginComponent, canActivate: [ClerkLoginGuard] },
  { path: '**', redirectTo: '' },
];
