import { Component } from '@angular/core';
import { NewProductComponent } from "../../component/new-product/new-product.component";
import { ProductCarouselComponent } from '../../component/product-carousel/product-carousel.component';

@Component({
  selector: 'app-new-product-page',
  standalone: true,
  imports: [NewProductComponent, ProductCarouselComponent],
  templateUrl: './new-product-page.component.html',
  styleUrl: './new-product-page.component.css'
})
export class NewProductPageComponent {

}
