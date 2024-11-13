import { Component, ViewEncapsulation } from '@angular/core';
import { CartComponent } from '../../component/cart/cart.component';

@Component({
  selector: 'app-cart-page',
  standalone: true,
  imports: [CartComponent],
  templateUrl: './cart-page.component.html',
  styleUrl: './cart-page.component.css',
  encapsulation: ViewEncapsulation.Emulated
})
export class CartPageComponent {

}
