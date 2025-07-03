import { Product } from './../../../product/interface/product';
import { Component, inject, OnInit, ViewEncapsulation } from '@angular/core';
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
import { AuthService } from '../../../auth/service/auth.service';
import { User } from '../../../auth/interface/user';
import { MercadoPagoService } from '../../../payments/mercado-pago.service';

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
  us = inject(AuthService);
  listProducts: { product: Product; quantity: number }[] = [];
  totalAmount: number = 0;
  prods = inject(ProductService);
  router = inject(Router);
  readonly dialog = inject(MatDialog);
  ss = inject(SalesService);
  mpago = inject(MercadoPagoService);

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

    const clerk_user_id = user.id;
    this.us
      .getUserByClerkId(clerk_user_id)
      .subscribe((userDB: User | undefined) => {
        if (
          !userDB ||
          !userDB.name ||
          !userDB.last_name ||
          !userDB.dni ||
          !userDB.address ||
          !userDB.phone_number
        ) {
          // Muestra alerta y redirige
          alert(
            'Debes completar tus datos de perfil antes de pagar. Serás redirigido a tu perfil.'
          );
          this.router.navigate(['/profile']);
          return;
        }
        // --- ARMADO DEL PAGO PARA MERCADOPAGO ---
        const itemsMP = this.listProducts.map((item) => ({
          id: item.product.id,
          title: item.product.name,
          quantity: item.quantity,
          currency_id: 'ARS',
          unit_price: Number(item.product.price),
        }));
        const payer_email =
          user.emailAddresses?.[0]?.emailAddress || 'test@pixelfactory.com';

        // Llamada al backend para crear preferencia de MercadoPago
        this.mpago
          .createPreference({
            items: itemsMP,
            email: payer_email,
            clerk_user_id,
          })
          .subscribe({
            next: (res) => {
              if (res && res.success && res.init_point) {
                // Redirigís al checkout de MercadoPago
                window.location.href = res.init_point;
              } else {
                alert('No se pudo iniciar el pago con MercadoPago');
                console.log(JSON.stringify(res));
              }
            },
            error: (err) => {
              console.error('Error en MercadoPago:', err);
              //alert('Error al iniciar pago con MercadoPago');
              alert(JSON.stringify(err.error));
            },
          });
      });
  }
}
