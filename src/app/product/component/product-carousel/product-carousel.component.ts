import { Component, inject, OnInit, ChangeDetectorRef, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Product } from '../../interface/product';
import { CarouselModule } from 'primeng/carousel';
import { ProductService } from '../../service/product.service';
import { CategoryCarouselComponent } from '../category-carousel/category-carousel.component';
import { User } from '../../../auth/interface/auth';
import { AuthService } from '../../../auth/service/auth.service';




@Component({
  selector: 'app-product-carousel',
  standalone: true,
  imports: [CommonModule, CarouselModule, CategoryCarouselComponent],
  templateUrl: './product-carousel.component.html',
  styleUrl: './product-carousel.component.css',
  encapsulation: ViewEncapsulation.Emulated
})
export class ProductCarouselComponent implements OnInit {

  productList:Product[]=[];
  showCarousel = true;
  filteredProducts: Product[] = [];
  
  authService=inject(AuthService);
  ps=inject(ProductService);
  cd = inject(ChangeDetectorRef);
  
  isAdmin=false;

  ngOnInit(): void {
      this.listProducts();
      this.authService.checkStatusAutentication().subscribe(
        auth => {
      // Revisa el ID para determinar si es un administrador
      if (this.getUser?.id === '1') {
        this.isAdmin = true;
      } else {
        this.isAdmin = false;
      }
        }
      );
  }

  get getUser(): User | undefined {
    return this.authService.currentUser;
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

  viewProductDetails(productId: string) {
    console.log("hola que tal");
  }

  addToCart(productId : string){
    console.log("agregado al carrito");
  }

  removeProduct(product:Product){
    
    if (confirm("Seguro que deseas eliminar " +`${product.name}`)) {
      this.ps.deleteProduct(product.id).subscribe(() => {
      window.location.reload(); // Recarga toda la página
    });
    alert(`${product.name}`+" Fue eliminado satisfactoriamente.");
    }else{
      console.log("eliminacion cancelada");
    }
    
  }

  updateProduct(productId : String){
    console.log("YA TAS READY PAL UPDATE");
  }

}
