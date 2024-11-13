import { Product } from './../../../product/interface/product';
import { Component, inject, OnInit, ViewEncapsulation } from '@angular/core';
import { CartService } from '../../service/cart.service';
import { Cart } from '../../interface/cart';
import { PayPalService } from '../../../paypal/paypal.service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.css',
  encapsulation: ViewEncapsulation.Emulated
})
export class CartComponent implements OnInit{
  cs=inject(CartService);
  ps = inject(PayPalService);
  listProducts: {product: Product; quantity: number}[]=[];
  totalAmount: number=0;

  ngOnInit(): void {
    this.loadCart();
  }
  //Mostrar Carrito
  loadCart(): void{
    this.listProducts=[];
    this.totalAmount=0;
    this.cs.getCart().subscribe({
      next: (cart: Cart)=>{
        this.totalAmount=0;//Precio total
        if(cart && cart.products){
          //Itero sobre los productos del carrito
          cart.products.forEach(carItem=>{
            this.cs.getProductDetails(carItem.idProduct).subscribe({
              next: (product: Product)=>{
                //Agrego producto a la lista y su cantidad
                this.listProducts.push({product, quantity: carItem.quantity});
                //Actualizar precio total
                this.totalAmount+= product.price * carItem.quantity;
              },
              error: (e: Error)=>{
                console.log(e.message);
              }
            });
          });
        }else{
          console.warn('El carrito esta vacio o no tiene productos');
        }
      },
      error: (e: Error)=>{
        console.log(e.message);
      }
    });
  }
  //Aumentar la cantidad de un producto del carrito
  increaseQuantity(productId: string): void {
    const productItem = this.listProducts.find(item => item.product.id === productId);
    if (productItem) {
      const newQuantity = productItem.quantity + 1;
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
  //Precio total redondeado para arriba
  getFormattedAmount(amount: number): string {
    return (Math.ceil(amount * 100) / 100).toFixed(2);
  }

    // Iniciar el pago con PayPal
    initiatePayment(): void {
      console.log('Iniciando pago con monto:', this.totalAmount); // Log del monto


    const messageElement = document.createElement('div');
    messageElement.innerText = "Te redirigiremos a PayPal...";
    messageElement.style.position = 'fixed';
    messageElement.style.top = '10px';
    messageElement.style.left = '50%';
    messageElement.style.transform = 'translateX(-50%)';
    messageElement.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
    messageElement.style.color = 'white';
    messageElement.style.padding = '10px';
    messageElement.style.borderRadius = '5px';
    document.body.appendChild(messageElement);

  // Eliminar el mensaje después de 3 segundos
  setTimeout(() => {
    document.body.removeChild(messageElement);
  }, 3000);

      const orderData = {
        items: this.listProducts.map(item => ({
          product: item.product,
          quantity: item.quantity
        })),
        totalAmount: this.totalAmount
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

  }
}
