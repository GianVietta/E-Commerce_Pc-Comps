import { Routes } from '@angular/router';
import { HomePageComponent } from './product/page/home-page/home-page.component';
import { ProfileComponent } from './auth/component/profile/profile.component';
import { DetailsProductComponent } from './product/component/details-product/details-product.component';

export const routes: Routes = [

    {path:'', component:HomePageComponent},
    {path:'profile', component:ProfileComponent},
    { path: 'product/:id', component: DetailsProductComponent }

];
