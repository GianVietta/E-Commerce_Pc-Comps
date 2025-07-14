import { Component, HostListener, OnInit, inject } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { Product } from '../../interface/product';
import { ProductService } from '../../service/product.service';
import { CommonModule } from '@angular/common';
import { CartService } from '../../../cart/service/cart.service';
import { FormsModule } from '@angular/forms';
import { ProductReviewsComponent } from '../product-reviews/product-reviews.component';
import { MatExpansionModule } from '@angular/material/expansion';

@Component({
  selector: 'app-details-product',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    ProductReviewsComponent,
    MatExpansionModule,
  ],
  templateUrl: './details-product.component.html',
  styleUrls: ['./details-product.component.css'],
})
export class DetailsProductComponent implements OnInit {
  product: Product | null = null;
  productService = inject(ProductService);
  cs = inject(CartService);
  selectedQuantity: number = 1;
  isAdmin = false;
  ps = inject(ProductService);
  successMessage: string | null = null;

  // Variables para mobile
  isMobile: boolean = false;
  showFullTitle: boolean = false;
  showFullDescription: boolean = false;

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.checkIfMobile();
    const productId = this.route.snapshot.paramMap.get('id');
    if (productId) {
      this.productService.getProductByid(productId).subscribe({
        next: (product) => {
          this.product = product;
          this.selectedQuantity = 1;
          console.log(this.product);
        },
      });
    }

    //Uso clerk para determinar si es admin
    const user = window.Clerk?.user;
    this.isAdmin = user?.publicMetadata?.['isAdmin'] === true;
  }

  addToCart() {
    const productId = this.route.snapshot.paramMap.get('id');
    this.productService.getProductByid(productId).subscribe({
      next: (product: Product) => {
        //Buscar si el producto existe en el carrito
        this.cs.getCart().subscribe({
          next: (cart) => {
            // Buscar si el producto ya está en el carrito
            const existingCartItem = cart.products.find(
              (item) => item.product_id === productId
            );
            // Si el producto ya está en el carrito, validar que no exceda el stock
            const currentQuantity = existingCartItem
              ? existingCartItem.quantity
              : 0;
            //Validar si agregar una unidad mas excede el stock
            if (this.selectedQuantity + currentQuantity > product.stock) {
              window.alert(
                'No se pueden agregar mas productos, porque supera el stock disponible. '
              );
              console.warn(
                'No se pueden agregar mas productos, porque supera el stock disponible. '
              );
              return;
            }
            //Si hay suficiente stock, agregar el producto al carrito
            this.cs
              .addProductToCart(product.id, this.selectedQuantity)
              .subscribe({
                next: () => {
                  this.successMessage = '¡Producto agregado al carrito!';
                  setTimeout(() => {
                    this.successMessage = null;
                  }, 1000); // 10 segundos
                  console.log('Agregado Correctamente');
                },
                error: (e: Error) => {
                  console.log(e.message);
                },
              });
          },
          error: (e: Error) => {
            console.error('Error al obtener el carrito: ', e.message);
          },
        });
      },
      error: (e: Error) => {
        console.error('Error al obtener el producto: ', e.message);
      },
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

  removeProduct(product: Product) {
    if (confirm('Seguro que deseas eliminar ' + `${product.name}`)) {
      this.ps.deleteProduct(product.id).subscribe(() => {
        if (this.product) {
          this.product.stock = 0;
        }
        this.successMessage = `${product.name} fue eliminado satisfactoriamente.`;
        setTimeout(() => {
          this.successMessage = null;
        }, 2500); // 2.5 segundos
      });
    } else {
      console.log('eliminacion cancelada');
    }
  }
  incrementQuantity() {
    if (this.selectedQuantity < (this.product?.stock ?? 1)) {
      this.selectedQuantity++;
    }
  }
  decrementQuantity() {
    if (this.selectedQuantity > 1) {
      this.selectedQuantity--;
    }
  }
  validateQuantity() {
    if (this.selectedQuantity < 1) {
      this.selectedQuantity = 1;
    }
    if (this.selectedQuantity > (this.product?.stock ?? 1)) {
      this.selectedQuantity = this.product?.stock ?? 1;
    }
  }

  // Manejo mobile
  @HostListener('window:resize', ['$event'])
  onResize() {
    this.checkIfMobile();
  }

  private checkIfMobile() {
    this.isMobile = window.innerWidth <= 650;
    // Si hago resize a desktop, cierro mobile
    if (!this.isMobile) {
      this.showFullTitle = false;
      this.showFullDescription = false;
    }
  }
  toggleTitle() {
    this.showFullTitle = !this.showFullTitle;
  }
  toggleDescription() {
    this.showFullDescription = !this.showFullDescription;
  }
}
