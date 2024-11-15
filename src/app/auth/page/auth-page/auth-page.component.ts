import { Component } from '@angular/core';
import { ProfileComponent } from '../../component/profile/profile.component';
import { SalesPageComponent } from '../../../sales/page/sales/sales-page.component';

@Component({
  selector: 'app-auth-page',
  standalone: true,
  imports: [ProfileComponent, SalesPageComponent],
  templateUrl: './auth-page.component.html',
  styleUrl: './auth-page.component.css'
})
export class AuthPageComponent {

}
