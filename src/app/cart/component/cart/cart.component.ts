import { Product } from './../../../product/interface/product';
import {
  Component,
  inject,
  OnInit,
  ViewEncapsulation,
} from '@angular/core';
import { CartService } from '../../service/cart.service';
import { Cart } from '../../interface/cart';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { LoginComponent } from '../../../auth/component/login/login.component';
import { ProductService } from '../../../product/service/product.service';
import {
  catchError,
  concatMap,
  firstValueFrom,
  from,
  Observable,
  tap,
  throwError,
} from 'rxjs';
import { SalesService } from '../../../sales/service/sales.service';
import { Clerk } from '@clerk/clerk-js';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.css',
  encapsulation: ViewEncapsulation.Emulated,
})
export class CartComponent implements OnInit {
  cs = inject(CartService);
  listProducts: { product: Product; quantity: number }[] = [];
  totalAmount: number = 0;
  prods = inject(ProductService);
  router = inject(Router);
  readonly dialog = inject(MatDialog);
  ss = inject(SalesService);

  async ngOnInit(): Promise<void> {
    await this.loadCart();
  }

  //Mostrar Carrito
  async loadCart(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.listProducts = [];
      this.totalAmount = 0;

      this.cs.getCart().subscribe({
        next: (cart: Cart) => {
          this.totalAmount = 0;
          if (cart && cart.products && cart.products.length > 0) {
            // Contador para trackear productos cargados
            let loadedProducts = 0;
            const totalProducts = cart.products.length;
            cart.products.forEach((cartItem) => {
              this.cs.getProductDetails(cartItem.product_id).subscribe({
                next: (product: Product) => {
                  console.log('Producto recibido: ', product);
                  this.listProducts.push({
                    product,
                    quantity: cartItem.quantity,
                  });
                  this.totalAmount += product.price * cartItem.quantity;
                  loadedProducts++;

                  if (loadedProducts === totalProducts) {
                    resolve();
                  }
                },
                error: (e: Error) => {
                  console.error('Error cargando detalles del producto:', e);
                  reject(e);
                },
              });
            });
          } else {
            console.warn('El carrito está vacío o no tiene productos');
            resolve(); // Resolvemos aunque esté vacío
          }
        },
        error: (e: Error) => {
          console.error('Error cargando el carrito:', e);
          reject(e);
        },
      });
    });
  }

  //Aumentar la cantidad de un producto del carrito
  increaseQuantity(productId: string): void {
    const productItem = this.listProducts.find(
      (item) => item.product.id === productId
    );
    if (productItem) {
      const newQuantity = productItem.quantity + 1;
      if (newQuantity > productItem.product.stock) {
        console.warn(
          'No se puede aumentar la cantidad mas alla del stock disponible. '
        );
        return; //Salir si la cantidad excede el stock
      }
      productItem.quantity = newQuantity;
      this.totalAmount += productItem.product.price; // Update total amount
      this.cs.updateProductQuantity(productId, newQuantity).subscribe({
        next: () => {
          this.loadCart(); // Recargar el carrito después de la actualización
        },
        error: (error) => {
          // Handle server errors gracefully (e.g., revert local changes)
          console.error('Error updating quantity:', error);
          productItem.quantity = newQuantity - 1; // Revert quantity change
          this.totalAmount -= productItem.product.price;
        },
      });
    }
  }

  //Disminuir la cantidad de un producto del carrito
  decreaseQuantity(productId: string): void {
    const productItem = this.listProducts.find(
      (item) => item.product.id === productId
    );
    if (productItem && productItem.quantity > 1) {
      const newQuantity = productItem.quantity - 1;
      productItem.quantity = newQuantity;
      this.totalAmount -= productItem.product.price; // Update total amount
      this.cs.updateProductQuantity(productId, newQuantity).subscribe({
        next: () => {
          this.loadCart();
        },
        error: (error) => {
          console.error('Error updating quantity:', error);
          productItem.quantity = newQuantity + 1; // Revert quantity change
          this.totalAmount += productItem.product.price;
        },
      });
    }
  }

  //Remover producto del carrito
  removeItem(productId: string): void {
    this.cs.removeProductFromCart(productId).subscribe({
      next: () => {
        this.loadCart();
      },
      error: (error) => console.error('Error al eliminar el producto:', error),
    });
  }

  //Precio total redondeado para arriba
  getFormattedAmount(amount: number): string {
    return (Math.ceil(amount * 100) / 100).toFixed(2);
  }

  // Iniciar el pago, luego agregar api MPago
  initiatePayment(): void {
    const user = window.Clerk?.user;
    if (!user) {
      // Si no esta logueado, abro el modal de clerk y que labure
      const dialogRef = this.dialog.open(LoginComponent, {
        disableClose: true,
        autoFocus: false,
        closeOnNavigation: false,
        position: { top: '50px' },
        width: '400px',
        panelClass: 'custom-dialog-container',
        data: { tipo: 'LOGIN' },
      });
      return; // Salgo
    }

    // Para que no siga sin productos
    if (this.listProducts.length === 0) {
      alert('El carrito esta vacio.');
      return;
    }

    // Primero traigo el carrito real del backend (asi tengo el cartId)
    this.cs.getCart().subscribe({
      next: (cart: Cart) => {
        if (!cart.id) {
          alert('No se pudo identificar el carrito del usuario.');
          return;
        }

        // Despues registro la venta (hago un POST a sale.php)
        const clerk_user_id = window.Clerk?.user?.id;
        const cart_id = cart.id;
        if (!clerk_user_id || !cart_id) {
          alert('Falta usuario o carrito vacio');
          return;
        }
        this.ss.addSale(clerk_user_id, cart_id).subscribe({
          next: (res) => {
            alert('!Compra exitosa!');
            this.router.navigate(['']);
          },
          error: (err) => {
            console.error('Error al registrar la venta: ', err);
            alert('Error al registrar la venta');
          },
        });
      },
      error: (e) => {
        console.error('Error al obtener el carrito: ', e);
        alert('Error al procesar el pago.');
      },
    });
  }
}
