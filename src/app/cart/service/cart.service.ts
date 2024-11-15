import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment.development';
import { map, Observable, of, switchMap } from 'rxjs';
import { Cart } from '../interface/cart';
import { Product } from '../../product/interface/product';
import { CartItem } from '../interface/cart-item';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  http= inject(HttpClient);
  urlBase= environment.urlCart;
  urlProducts= environment.urlProducts;
  
  //Retorna 1 y no arreglo porque existe un solo carrito 
  getCart(): Observable<Cart> {
    return this.http.get<Cart[]>(this.urlBase).pipe(
      map(carts => {
        if (carts.length > 0) {
          return carts[0]; // Selecciona el primer carrito
        } else {
          // Si no hay carritos, crear uno vacío por defecto
          return {
            id: '1',
            idUser: '',
            totalAmount: 0,
            products: []
          };
        }
      })
    );
  }
  //Agregar producto al carrito 
  addProductToCart(idProduct: string, quantity: number): Observable<Cart> {
    return this.getCart().pipe(
      switchMap(cart => {
        // Verificar si el producto ya está en el carrito
        const existingProductIndex = cart.products.findIndex(p => p.idProduct === idProduct);
        if (existingProductIndex !== -1) {
          // Si existe, actualiza la cantidad
          cart.products[existingProductIndex].quantity += quantity;
        } else {
          // Si no existe, agregar nuevo producto
          cart.products.push({ idProduct, quantity });
        }
  
        // Recalcular el monto total
        return this.calculateTotalAmount(cart).pipe(
          switchMap(updatedCart => {
            // Actualiza el carrito
            return this.http.put<Cart>(`${this.urlBase}/1`, updatedCart); // `1` es el id del carrito
          })
        );
      })
    );
  }
  
  // Actualizar la cantidad de un producto en el carrito
  updateProductQuantity(idProduct: string, quantity: number): Observable<Cart> {
    return this.getCart().pipe(
      switchMap(cart => {
        const productIndex = cart.products.findIndex(p => p.idProduct === idProduct);
        
        if (productIndex !== -1) {
          // Actualizar la cantidad del producto
          cart.products[productIndex].quantity = quantity;
          
          // Recalcular el monto total
          return this.calculateTotalAmount(cart).pipe(
            switchMap(updatedCart => {
              // Actualizar solo el carrito con idUser = 1
              const idUser= updatedCart.idUser;
              updatedCart.idUser= '1';
              return this.http.put<Cart>(`${this.urlBase}/${updatedCart.id}`, updatedCart); // Actualiza con idUser=1
            })
          );
        } else {
          throw new Error(`Producto con id ${idProduct} no encontrado en el carrito`);
        }
      })
    );
  }
  private calculateTotalAmount(cart: Cart): Observable<Cart> {
    if(cart.products.length===0){
      cart.totalAmount=0;
      return of(cart);
    }
    return new Observable(observer => {
      let totalAmount = 0;
      let completedRequests = 0;
      
      cart.products.forEach(item => {
        this.getProductDetails(item.idProduct).subscribe({
          next: (product) => {
            totalAmount += product.price * item.quantity;
            completedRequests++;
            
            if (completedRequests === cart.products.length) {
              cart.totalAmount = totalAmount;
              observer.next(cart);
              observer.complete();
            }
          },
          error: (error) => observer.error(error)
        });
      });
    });
  }
  // Eliminar un producto del carrito
  removeProductFromCart(idProduct: string): Observable<Cart> {
    return this.getCart().pipe(
      switchMap(cart => {
        cart.products = cart.products.filter(p => p.idProduct !== idProduct);
        
        return this.calculateTotalAmount(cart).pipe(
          switchMap(updatedCart => {
            const idUser= updatedCart.idUser;
            updatedCart.id= '1';
            return this.http.put<Cart>(`${this.urlBase}/${updatedCart.id}`, updatedCart); // Actualiza el carrito
          })
        );
      })
    );
  }
  // Vaciar el carrito 
  resetCart(): Observable<Cart> {
    return this.getCart().pipe(
      switchMap(cart => {
        // Vaciar los productos y setear el totalAmount a 0
        cart.idUser = '';
        cart.totalAmount = 0;
        cart.products = [];
        
        // Asegurar que el id sea '1'
        cart.id= '1';
        // Actualizar el carrito vacío
        return this.http.put<Cart>(`${this.urlBase}/${cart.id}`, cart);
      })
    );
  }
  //Update cart 
  updateCart(updatedCart: Cart): Observable<Cart>{
    return this.http.put<Cart>(`${this.urlBase}/${updatedCart.id}`,updatedCart);
  }
  //Obtener detalle productos
  getProductDetails(idProduct: string): Observable<Product>{
    return this.http.get<Product>(`${this.urlProducts}/${idProduct}`);
  }
}
