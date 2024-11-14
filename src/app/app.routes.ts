import { Routes } from '@angular/router';
import { HomePageComponent } from './product/page/home-page/home-page.component';
import { ProfileComponent } from './auth/component/profile/profile.component';
import { DetailsProductComponent } from './product/component/details-product/details-product.component';
import { NewProductPageComponent } from './product/page/new-product-page/new-product-page.component';
import { AuthGuard } from './auth/guard/auth-guard';
import { AdminGuard } from './auth/guard/admin-guard';
import { CartPageComponent } from './cart/page/cart-page/cart-page.component';
import { SalesComponent } from './sales/component/sales/sales.component';


export const routes: Routes = [

    {path:'', component:HomePageComponent},
    {path:'profile', component:ProfileComponent, canActivate:[AuthGuard]},
    { path: 'product/:id', component: DetailsProductComponent },
    {path: 'new-product', component: NewProductPageComponent, canActivate:[AdminGuard]},
    {path:'cart', component:CartPageComponent},
    {path:'sales', component:SalesComponent},
    {path:'**' , redirectTo:'' }
];
