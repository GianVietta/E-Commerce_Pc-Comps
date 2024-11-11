import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Product } from '../../interface/product';
import { CarouselModule } from 'primeng/carousel';
import { ProductService } from '../../service/product.service';
import { CategoryCarouselComponent } from '../category-carousel/category-carousel.component';
import { Router } from '@angular/router';


@Component({
  selector: 'app-product-carousel',
  standalone: true,
  imports: [CommonModule, CarouselModule, CategoryCarouselComponent],
  templateUrl: './product-carousel.component.html',
  styleUrl: './product-carousel.component.css'
})
export class ProductCarouselComponent implements OnInit {

  productList:Product[]=[];
  showCarousel = true;
  filteredProducts: Product[] = [];
  
  ps=inject(ProductService);
  cd = inject(ChangeDetectorRef);
  router=inject(Router);

  ngOnInit(): void {
      this.listProducts();
  }

  listProducts(){
    this.ps.getProduct().subscribe(
      {
        next: (products:Product[])=>{
          this.productList=products
          this.filteredProducts = products;
        },
        error:(e:Error)=>{
          console.log(e);
        }
        
      }
    )
  }

  onCategorySelected(category: string) {
    console.log('Categoría seleccionada:', category);
    if (category === 'Todos') {
      this.filteredProducts = [...this.productList];
    } else {
      this.filteredProducts = this.productList.filter(product => product.category === category);
    }
    this.showCarousel = false;
    this.cd.detectChanges();
    this.showCarousel = true;
    
    console.log('Productos filtrados:', this.filteredProducts);
  }

  viewProductDetails(productId: number) {
    this.router.navigate(['/product', productId]);
  }

}
