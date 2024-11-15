import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { Product } from '../../interface/product';
import { ProductService } from '../../service/product.service';
import { CommonModule } from '@angular/common';
import { CartService } from '../../../cart/service/cart.service';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../auth/service/auth.service';
import { User } from '../../../auth/interface/auth';

@Component({
  selector: 'app-details-product',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './details-product.component.html',
  styleUrls: ['./details-product.component.css']
})
export class DetailsProductComponent implements OnInit {
  product: Product | null = null;
  productService = inject(ProductService)
  cs = inject(CartService)
  selectedQuantity:number = 0;
  authService=inject(AuthService);
  isAdmin=false;
  ps = inject(ProductService);


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
            this.cs.addProductToCart(product.id,this.selectedQuantity).subscribe({
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

  contactSupport() {
    // Número de WhatsApp de soporte 
    const supportNumber = '2234461446';

    // Mensaje de contacto personalizado
    const supportMessage = '¡Hola! Tengo una duda sobre el servicio.';

    // Codificar el mensaje para la URL
    const encodedMessage = encodeURIComponent(supportMessage);

    // Construir la URL completa de WhatsApp
    const whatsappUrl = `https://wa.me/${supportNumber}?text=${encodedMessage}`;

    // Abrir el enlace de WhatsApp en una nueva pestaña
    window.open(whatsappUrl, '_blank');
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

}
