import { Product } from './../../../product/interface/product';
import { Component, inject, OnInit, ViewEncapsulation } from '@angular/core';
import { CartService } from '../../service/cart.service';
import { Cart } from '../../interface/cart';

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
}
