import { Product } from './../../../product/interface/product';
import { Component, inject, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { CartService } from '../../service/cart.service';
import { Cart } from '../../interface/cart';
import { HttpErrorResponse } from '@angular/common/http';
import { PayPalService } from '../../../paypal/paypal.service';
import { AuthService } from '../../../auth/service/auth.service';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { User } from '../../../auth/interface/auth';
import { LoginComponent } from '../../../auth/component/login/login.component';
import { ProductService } from '../../../product/service/product.service';
import { catchError, concatMap, firstValueFrom, from, Observable, tap, throwError } from 'rxjs';
import { Sales } from '../../../sales/interface/sales';
import { SalesService } from '../../../sales/service/sales.service';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.css',
  encapsulation: ViewEncapsulation.Emulated
})
export class CartComponent implements OnInit{
  cs=inject(CartService);
  listProducts: {product: Product; quantity: number}[]=[];
  totalAmount: number=0;
  prods= inject(ProductService);
  ps = inject(PayPalService);
  authService = inject(AuthService);
  router = inject(Router);
  readonly dialog = inject(MatDialog);
  paymentStatus: string | null = null;
  userId: string | null = null;
  route = inject(ActivatedRoute);
  ss= inject(SalesService);

  async ngOnInit(): Promise<void> {
    await this.loadCart();
    this.route.queryParams.subscribe(async params => {
    this.paymentStatus = params['paymentStatus'];
    this.userId = params['userId'];
    console.log(this.userId);
      // Si el pago fue exitoso, limpia el carrito
      if (this.paymentStatus === 'success') {
        try {
          await this.updateStock(...[this.listProducts]);
          this.authService.checkStatusAutentication().subscribe(
            auth => {
              if (this.getUser==undefined) {
                // Maneja el caso en que userId sea null
                console.error('El userId es nulo');
    
              }else {
                this.userId=this.getUser?.id;
                console.log(this.userId);
                this.addNewSale(this.userId, ...[this.listProducts]);
            }
          }
        );
        
          // Solo limpiar el carrito si la actualización de stock fue exitosa
          this.cs.resetCart().subscribe({
            next: () => {
              console.log('Carrito limpiado después del pago exitoso.');
              this.router.navigate(['/sales']);
            },
            error: (error) => {
              console.error('Error al limpiar el carrito:', error);
            }
          });
        } catch (error) {
          console.error('Error en el proceso de actualización de stock:', error);
          // Aquí podrías mostrar un mensaje al usuario o manejar el error de otra forma
        }
      }
    });
  }


  user: User | undefined = this.authService.currentUser;

  get getUser(): User | undefined {
    return this.authService.currentUser;
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

            cart.products.forEach(cartItem => {
              this.cs.getProductDetails(cartItem.idProduct).subscribe({
                next: (product: Product) => {
                  this.listProducts.push({ product, quantity: cartItem.quantity });
                  this.totalAmount += product.price * cartItem.quantity;
                  
                  loadedProducts++;
                  if (loadedProducts === totalProducts) {
                    console.log('Todos los productos cargados:', this.listProducts);
                    resolve();
                  }
                },
                error: (e: Error) => {
                  console.error('Error cargando detalles del producto:', e);
                  reject(e);
                }
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
        }
      });
    });
  }
  //Aumentar la cantidad de un producto del carrito
  increaseQuantity(productId: string): void {
    const productItem = this.listProducts.find(item => item.product.id === productId);
    if (productItem) {
      const newQuantity = productItem.quantity + 1;
      if(newQuantity>productItem.product.stock){
        console.warn('No se puede aumentar la cantidad mas alla del stock disponible. ');
        return; //Salir si la cantidad excede el stock
      }
      productItem.quantity= newQuantity;
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
        }
      });
    }
  }
  //Disminuir la cantidad de un producto del carrito
  decreaseQuantity(productId: string): void {
    const productItem = this.listProducts.find(item => item.product.id === productId);
    if (productItem && productItem.quantity > 1) {
      const newQuantity = productItem.quantity - 1;
      productItem.quantity= newQuantity;
      this.totalAmount -= productItem.product.price; // Update total amount
      this.cs.updateProductQuantity(productId, newQuantity).subscribe({
        next: () => {
          this.loadCart();
        },
        error: (error) => {
          console.error('Error updating quantity:', error);
          productItem.quantity = newQuantity + 1; // Revert quantity change
          this.totalAmount += productItem.product.price;
        }
      });
    }
  }
  //Remover producto del carrito
  removeItem(productId: string): void {
    this.cs.removeProductFromCart(productId).subscribe({
      next: () => {
        this.loadCart();
      },
      error: (error) => console.error('Error al eliminar el producto:', error)
    });
  }
  //Vaciar carrito
  // Lógica para manejar el cierre de la página
  // Maneja cuando la página se recarga
  handlePageLoad(): void {
    // Marca que la página ha sido recargada, evitando que el carrito se vacíe
    sessionStorage.setItem('isPageReloaded', 'true');
  }

  // Función para manejar el cierre de la página
  handlePageClose(event: BeforeUnloadEvent): void {
    if (sessionStorage.getItem('isPageReloaded') === 'false') {
      // Si no es una recarga, vaciar el carrito
      this.cs.resetCart().subscribe({
        next: () => {
          console.log('Carrito vacío con éxito al salir de la página');
        },
        error: (e: Error) => {
          console.error('Error al vaciar el carrito:', e);
        }
      });
    }
  }


  //Precio total redondeado para arriba
  getFormattedAmount(amount: number): string {
    return (Math.ceil(amount * 100) / 100).toFixed(2);
  }


  login() {
    const dialogRef = this.dialog.open(LoginComponent, {
      disableClose: true,
      autoFocus: false,
      closeOnNavigation: false,
      position: { top: '50px' },
      width: '1000px',
      data: { tipo: 'LOGIN' }
    });

    dialogRef.afterClosed().subscribe(result => {
      this.authService.checkStatusAutentication().subscribe(
        auth => {

        }
      );
    });
  }
  // Método asíncrono para agregar una nueva venta
  async addNewSale(userId: string, list: {product: Product; quantity: number}[]): Promise<void>{
    const newSale: Sales = {
      id: crypto.randomUUID(), // Genera un UUID único
      idUser: userId, // Ajusta el id de usuario según sea necesario
      date: new Date().toISOString(), // Genera la fecha actual en formato ISO string
      totalAmount: this.totalAmount, // Ajusta el monto total según tu lógica
      products: []= list.map(item=>({
        idProduct: item.product.id,
        quantity: item.quantity
      })) // Añade los productos que correspondan
    };

    try {
      // Llamada asíncrona al servicio usando await
      this.ss.addSale(newSale).subscribe({
        next: (sale)=>{
          console.log(`${sale} agregado correctamente.`);
        },
        error: (e:Error)=>{
          console.warn('Error al agregar la venta. ', e.message);
        }
      });
    } catch (error) {
      console.error('Error al crear la venta:', error);
      throw error;
    }
  }

  async updateStock(list: {product: Product; quantity: number}[]): Promise<void> {
    try {
      await this.loadCart();
      console.log('Iniciando actualización de stock para', list.length, 'productos');
      console.log('Lista de productos a actualizar:', list);
      
      if (list.length === 0) {
        throw new Error('La lista de productos está vacía');
      }

      for (const item of list) {
        const newStock = item.product.stock - item.quantity;
        console.log(`Actualizando producto ${item.product.id}:`, {
          productId: item.product.id,
          currentStock: item.product.stock,
          quantity: item.quantity,
          newStock: newStock
        });
        
        if (newStock < 0) {
          throw new Error(`Stock insuficiente para el producto ${item.product.id}`);
        }

        const updateProduct: Product = {
          ...item.product,
          stock: newStock
        };

        await firstValueFrom(this.prods.putProduct(updateProduct, item.product.id));
        console.log(`Stock actualizado para producto ${item.product.id} a ${newStock}`);
      }

      console.log('Actualización de stock completada exitosamente');
    } catch (error) {
      console.error('Error en la actualización del stock:', error);
      throw error;
    }
  }


  // Iniciar el pago con PayPal
  initiatePayment(): void {

    this.authService.checkStatusAutentication().subscribe(isAuthenticated => {
      if (!isAuthenticated) {
        // Mostrar mensaje y redirigir al inicio de sesión si no está autenticado
        this.login();
        // Redirigir a la home

        return;
      }

      // Solo continúa con el proceso de pago si está autenticado
      console.log('Iniciando pago con monto:', this.totalAmount); // Log del monto

      if(this.totalAmount == 0 ){
        alert("Primero debes agregar productos");
        return;
      }


      const messageElement = document.createElement('div');
      messageElement.innerText = "Te redirigiremos a PayPal...";
      messageElement.style.position = 'absolute';
      messageElement.style.zIndex='20'
      messageElement.style.top = '55%';
      messageElement.style.left = '50%';
      messageElement.style.transform = 'translateX(-50%)';
      messageElement.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
      messageElement.style.color = 'white';
      messageElement.style.padding = '25px';
      messageElement.style.borderRadius = '5px';
      document.body.appendChild(messageElement);

      // Eliminar el mensaje después de 3 segundos
      setTimeout(() => {
        document.body.removeChild(messageElement);
      }, 3000);

      const orderData = {  //se mandan los productos y el id del usuario
        items: this.listProducts.map(item => ({
          product: item.product,
          quantity: item.quantity
        })),
        totalAmount: this.totalAmount,
        userId: this.authService.currentUser?.id
      };

      console.log('Datos de la orden a enviar:', orderData);

      // Llamada al servicio para crear la orden
      this.ps.createOrder(orderData).subscribe({
        next: (response) => {
          console.log('Respuesta completa de PayPal:', response); // Log de la respuesta completa de PayPal

          // Verificar si la respuesta tiene los links para aprobación
          if (response.links) {
            console.log('Links de PayPal encontrados:', response.links); // Log de los links

            const approveLink = response.links.find((link: any) => link.rel === "approve");
            if (approveLink) {
              console.log('URL de aprobación encontrada:', approveLink.href); // Log del enlace de aprobación
              window.location.href = approveLink.href; // Redirigir al enlace de aprobación
            } else {
              console.error('No se encontró el enlace de aprobación en la respuesta');
            }
          } else {
            console.error('Respuesta de PayPal no contiene links:', response);
          }
        },

        error: (error: HttpErrorResponse) => {
          // Log detallado del error
          console.error('Error detallado al crear la orden en PayPal:', {
            status: error.status,
            statusText: error.statusText,
            message: error.message,
            error: error.error,
            url: error.url
          });

          if (error.status === 0) {
            console.error('Error de conexión con el servidor backend');
          } else if (error.status === 401) {
            console.error('Error de autenticación con PayPal');
          } else if (error.status === 400) {
            console.error('Error en los datos enviados:', error.error);
          } else {
            console.error('Error inesperado:', error);
          }

          // Aquí podrías mostrar un mensaje al usuario
          alert('Error al procesar el pago. Por favor, intente nuevamente.');
        }
      });
    });
  }
}



