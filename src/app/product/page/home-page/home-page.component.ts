import { Component, ViewEncapsulation } from '@angular/core';
import { ProductCarouselComponent } from "../../component/product-carousel/product-carousel.component";

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [ProductCarouselComponent],
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.css',
  encapsulation: ViewEncapsulation.Emulated
})
export class HomePageComponent {

}
