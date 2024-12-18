import { Routes } from '@angular/router';
import { HomePageComponent } from './product/page/home-page/home-page.component';
import { ProfileComponent } from './auth/component/profile/profile.component';
import { DetailsProductComponent } from './product/component/details-product/details-product.component';
import { NewProductPageComponent } from './product/page/new-product-page/new-product-page.component';
import { AuthGuard } from './auth/guard/auth-guard';
import { AdminGuard } from './auth/guard/admin-guard';
import { UpdateProductComponent } from './product/component/update-product/update-product.component';
import { CartPageComponent } from './cart/page/cart-page/cart-page.component';
import { SalesPageComponent } from './sales/page/sales/sales-page.component';
import { AuthPageComponent } from './auth/page/auth-page/auth-page.component';
import { SerchProductComponent } from './product/component/serch-product/serch-product.component';


export const routes: Routes = [

    {path: '', component:HomePageComponent},
    {path: 'profile', component:AuthPageComponent, canActivate:[AuthGuard]},
    {path: 'product/:id', component: DetailsProductComponent},
    {path: 'update-product/:id', component: UpdateProductComponent},
    {path: 'new-product', component: NewProductPageComponent, canActivate:[AdminGuard]},
    {path: 'cart', component:CartPageComponent},
    {path: 'sales-page', component:SalesPageComponent},
    {path: 'search-results', component: SerchProductComponent },
    {path: '**' , redirectTo:'' }
];
