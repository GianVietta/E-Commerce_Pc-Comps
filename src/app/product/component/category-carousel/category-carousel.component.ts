import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  inject,
  OnInit,
  Output,
  ViewEncapsulation,
} from '@angular/core';
import { CarouselModule } from 'primeng/carousel';

@Component({
  selector: 'app-category-carousel',
  standalone: true,
  imports: [CarouselModule],
  templateUrl: './category-carousel.component.html',
  styleUrl: './category-carousel.component.css',
  encapsulation: ViewEncapsulation.Emulated,
})
export class CategoryCarouselComponent implements OnInit {
  categorias = [
    'Todos',
    'CPU',
    'MotherBoard',
    'RAM',
    'Tarjeta de video',
    'Almacenamiento',
    'Fuente',
    'Refrigeracion',
    'Gabinete',
  ];

  @Output() categorySelected = new EventEmitter<string>();

  // Control para mobile
  drawerOpen = false;
  isMobile = window.innerWidth < 650;
  cd = inject(ChangeDetectorRef);

  ngOnInit(): void {
    this.updateMobile();
    window.addEventListener('resize', this.updateMobile.bind(this));
  }

  updateMobile() {
    const wasMobile = this.isMobile;
    this.isMobile = window.innerWidth < 650;
    if (wasMobile !== this.isMobile) {
      this.drawerOpen = false;
    }
    this.cd.detectChanges();
  }

  selectCategory(category: string) {
    this.categorySelected.emit(category);
    this.drawerOpen = false;
  }

  openDrawer() {
    this.drawerOpen = true;
  }

  closeDrawer() {
    this.drawerOpen = false;
  }
}
