import { Component } from '@angular/core';
import { NewProductComponent } from "../../component/new-product/new-product.component";

@Component({
  selector: 'app-new-product-page',
  standalone: true,
  imports: [NewProductComponent],
  templateUrl: './new-product-page.component.html',
  styleUrl: './new-product-page.component.css'
})
export class NewProductPageComponent {

}