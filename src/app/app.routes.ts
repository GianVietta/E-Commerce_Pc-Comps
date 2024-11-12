import { Routes } from '@angular/router';
import { HomePageComponent } from './product/page/home-page/home-page.component';
import { ProfileComponent } from './auth/component/profile/profile.component';

export const routes: Routes = [

    {path:'', component:HomePageComponent},
    {path:'profile', component:ProfileComponent}

];
