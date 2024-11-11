import { Component, EventEmitter, Output } from '@angular/core';
import { CarouselModule } from 'primeng/carousel';

@Component({
  selector: 'app-category-carousel',
  standalone: true,
  imports: [CarouselModule],
  templateUrl: './category-carousel.component.html',
  styleUrl: './category-carousel.component.css'
})
export class CategoryCarouselComponent {
  categorias=["Todos","CPU","MotherBoard","RAM","Tarjeta de video","Almacenamiento","Fuente","Refrigeracion","Gabinete"]
  
  @Output() categorySelected = new EventEmitter<string>();

  selectCategory(category: string) {
    this.categorySelected.emit(category);
  }
}
