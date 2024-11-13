import { Routes } from '@angular/router';
import { HomePageComponent } from './product/page/home-page/home-page.component';
import { SalesPageComponent } from './sales/page/sales-page/sales-page.component';

export const routes: Routes = [
    {path:'', component:HomePageComponent},
    {path:'sales',component:SalesPageComponent}
];
