import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Product } from '../../interface/product';
import { ProductService } from '../../service/product.service';
import { CommonModule } from '@angular/common';
import { CartService } from '../../../cart/service/cart.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-details-product',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './details-product.component.html',
  styleUrls: ['./details-product.component.css']
})
export class DetailsProductComponent implements OnInit {
  product: Product | null = null;
  productService = inject(ProductService)
  cs = inject(CartService)
  selectedQuantity:number = 0;


  constructor(
    private route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    const productId = this.route.snapshot.paramMap.get('id');
    if (productId) {
      this.productService.getProductByid(productId).subscribe({
        next: (product) => {
          this.product = product;
          console.log(this.product);
        }
      })
    }
    
  }

  addToCart(){
    const productId = this.route.snapshot.paramMap.get('id');
    this.productService.getProductByid(productId).subscribe({
      next: (product: Product)=>{
        //Buscar si el producto existe en el carrito 
        this.cs.getCart().subscribe({
          next:(cart)=>{
            // Buscar si el producto ya está en el carrito
            const existingCartItem= cart.products.find(item=>item.idProduct===productId);
            // Si el producto ya está en el carrito, validar que no exceda el stock
            const currentQuantity= existingCartItem? existingCartItem.quantity:0;   
            //Validar si agregar una unidad mas excede el stock 
            if(this.selectedQuantity+currentQuantity>product.stock){
              window.alert('No se pueden agregar mas productos, porque supera el stock disponible. ');
              console.warn('No se pueden agregar mas productos, porque supera el stock disponible. ');
              return;
            }
            //Si hay suficiente stock, agregar el producto al carrito 
            this.cs.addProductToCart(product.id,1).subscribe({
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


}
