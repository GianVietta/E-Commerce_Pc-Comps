import { Component, inject, OnInit, ChangeDetectorRef, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Product } from '../../interface/product';
import { CarouselModule } from 'primeng/carousel';
import { ProductService } from '../../service/product.service';
import { CategoryCarouselComponent } from '../category-carousel/category-carousel.component';
import { User } from '../../../auth/interface/auth';
import { AuthService } from '../../../auth/service/auth.service';
import { Router, RouterModule } from '@angular/router';
import { CartService } from '../../../cart/service/cart.service';





@Component({
  selector: 'app-product-carousel',
  standalone: true,
  imports: [CommonModule, CarouselModule, CategoryCarouselComponent, RouterModule],
  templateUrl: './product-carousel.component.html',
  styleUrl: './product-carousel.component.css',
  encapsulation: ViewEncapsulation.Emulated
})
export class ProductCarouselComponent implements OnInit {

  productList:Product[]=[];
  showCarousel = true;
  filteredProducts: Product[] = [];
  
  cs=inject(CartService);
  authService=inject(AuthService);
  ps=inject(ProductService);
  cd = inject(ChangeDetectorRef);
  router=inject(Router);
  
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
    this.router.navigateByUrl('/product/:id')
  }

  addToCart(productId : string){
    //Obtener el producto por su ID
    this.ps.getProductByid(productId).subscribe({
      next: (product: Product)=>{
        //Buscar si el producto existe en el carrito 
        this.cs.getCart().subscribe({
          next:(cart)=>{
            // Buscar si el producto ya está en el carrito
            const existingCartItem= cart.products.find(item=>item.idProduct===productId);
            // Si el producto ya está en el carrito, validar que no exceda el stock
            const currentQuantity= existingCartItem? existingCartItem.quantity:0;   
            //Validar si agregar una unidad mas excede el stock 
            if(currentQuantity+1>product.stock){
              window.alert('No se pueden agregar mas productos, porque supera el stock disponible. ');
              console.warn('No se pueden agregar mas productos, porque supera el stock disponible. ');
              return;
            }
            //Si hay suficiente stock, agregar el producto al carrito 
            this.cs.addProductToCart(productId,1).subscribe({
              next: ()=>{
                console.log("Agregado Correctamente");
              },
              error: (e: Error)=>{
                console.log(e.message);
              }
            });
          },
          error: (e:Error)=>{
            console.error('Error al obtener el carrito: ',e.message);
          }
        });
      },
      error: (e:Error)=>{
        console.error('Error al obtener el producto: ',e.message);
      }
    });
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
