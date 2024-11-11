import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Product } from '../../interface/product';
import { CarouselModule } from 'primeng/carousel';
import { ProductService } from '../../service/product.service';


@Component({
  selector: 'app-product-carousel',
  standalone: true,
  imports: [CommonModule, CarouselModule],
  templateUrl: './product-carousel.component.html',
  styleUrl: './product-carousel.component.css'
})
export class ProductCarouselComponent implements OnInit {
  productList:Product[]=[];
  ps=inject(ProductService)
  ngOnInit(): void {
      this.listProducts();
  }
  listProducts(){
    this.ps.getProduct().subscribe(
      {
        next: (products:Product[])=>{
          this.productList=products
        },
        error:(e:Error)=>{
          console.log(e);
        }
        
      }
    )
  }

}
