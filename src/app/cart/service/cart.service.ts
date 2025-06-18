import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment.development';
import { map, Observable, of, switchMap, forkJoin, tap } from 'rxjs';
import { Cart } from '../interface/cart';
import { Product } from '../../product/interface/product';
import { CartItem } from '../interface/cart-item';

@Injectable({
  providedIn: 'root',
})
export class CartService {
  http = inject(HttpClient);
  urlBase = environment.urlCart;
  urlProducts = environment.urlProducts;

  // Clave del carrito en localStorage
  private localStorageKey = 'cart';

  //Verifico si esta logueado
  isLoggedIn(): boolean {
    return !!window.Clerk?.user?.id;
  }
  getClerkUserId(): string {
    return window.Clerk?.user?.id ?? '';
  }

  // Obtengo el carrito actual (de la base si esta logueado, de localStorage si es invitado)
  getCart(): Observable<Cart> {
    if (this.isLoggedIn()) {
      const userId = window.Clerk?.user?.id;
      // Pido el carrito del usuario al backend, me deberia devolver el carrito y su id
      return this.http
        .get<Cart>(`${this.urlBase}?clerk_user_id=${userId}`)
        .pipe(
          map((cart) => ({
            ...cart,
            id: cart?.id ?? '',
            clerk_user_id: userId,
            totalAmount: cart?.totalAmount ?? 0,
            products: Array.isArray(cart?.products) ? cart.products : [],
          }))
        );
    } else {
      // Carrito en localStorage
      const cart: Cart = JSON.parse(
        localStorage.getItem(this.localStorageKey) ||
          '{"id": " ", "idUser": " ", "totalAmount": 0, "products": []}'
      );
      return of(cart);
    }
  }

  // Guarda el carrito en localStorage solo para invitados
  private saveCartToLocal(cart: Cart) {
    localStorage.setItem(this.localStorageKey, JSON.stringify(cart));
  }

  //Agregar producto al carrito (tanto logueado como invitado)
  addProductToCart(idProduct: string, quantity: number): Observable<Cart> {
    return this.getCart().pipe(
      switchMap((cart) => {
        const idx = cart.products.findIndex((p) => p.product_id === idProduct);
        if (idx !== -1) {
          cart.products[idx].quantity += quantity;
        } else {
          cart.products.push({ product_id: idProduct, quantity });
        }

        return this.calculateTotalAmount(cart).pipe(
          switchMap((updatedCart) => {
            if (this.isLoggedIn()) {
              // Si el carrito no existe (id vacio), hago POST y el back arma uno nuevo
              if (!updatedCart.id) {
                const userId = window.Clerk?.user?.id;
                return this.http.post<Cart>(this.urlBase, {
                  clerk_user_id: userId,
                  items: updatedCart.products.map((i) => ({
                    product_id: i.product_id,
                    quantity: i.quantity,
                  })),
                });
              }

              // Si el carrito existe, actualizo con PUT (usando el id del carrito del back)
              return this.http.put<Cart>(
                `${this.urlBase}?id=${updatedCart.id}`,
                updatedCart
              );
            } else {
              // Invitado guardo en localStorage
              this.saveCartToLocal(updatedCart);
              return of(updatedCart);
            }
          })
        );
      })
    );
  }

  // Actualizar la cantidad de un producto en el carrito
  updateProductQuantity(
    product_id: string,
    quantity: number
  ): Observable<Cart> {
    if (this.isLoggedIn()) {
      // Hago POST al back para actualizar solo ese item
      return this.http.post<Cart>(`${this.urlBase}`, {
        clerk_user_id: this.getClerkUserId(),
        items: [{ product_id, quantity }],
        action: 'update_quantity',
      });
    } else {
      // Manejo de locaStorage
      const cart = this.getCartLocal();
      const idx = cart.products.findIndex((p) => p.product_id === product_id);
      if (idx !== -1) cart.products[idx].quantity = quantity;
      this.saveCartToLocal(cart);
      return this.calculateTotalAmount(cart);
    }
  }

  private calculateTotalAmount(cart: Cart): Observable<Cart> {
    if (cart.products.length === 0) {
      cart.totalAmount = 0;
      return of(cart);
    }
    return new Observable((observer) => {
      let totalAmount = 0;
      let completedRequests = 0;

      cart.products.forEach((item) => {
        this.getProductDetails(item.product_id).subscribe({
          next: (product) => {
            totalAmount += product.price * item.quantity;
            completedRequests++;

            if (completedRequests === cart.products.length) {
              cart.totalAmount = totalAmount;
              observer.next(cart);
              observer.complete();
            }
          },
          error: (error) => observer.error(error),
        });
      });
    });
  }

  // Eliminar un producto del carrito
  removeProductFromCart(idProduct: string): Observable<Cart> {
    return this.getCart().pipe(
      switchMap((cart) => {
        cart.products = cart.products.filter((p) => p.product_id !== idProduct);
        return this.calculateTotalAmount(cart).pipe(
          switchMap((updatedCart) => {
            if (this.isLoggedIn()) {
              if (!updatedCart.id) return of(updatedCart);
              return this.http.put<Cart>(
                `${this.urlBase}?id=${updatedCart.id}`,
                updatedCart
              );
            } else {
              this.saveCartToLocal(updatedCart);
              return of(updatedCart);
            }
          })
        );
      })
    );
  }

  // Vaciar el carrito
  resetCart(): Observable<Cart> {
    return this.getCart().pipe(
      switchMap((cart) => {
        const emptyCart: Cart = { ...cart, products: [], totalAmount: 0 };
        if (this.isLoggedIn()) {
          if (!emptyCart.id) return of(emptyCart);
          return this.http.put<Cart>(
            `${this.urlBase}?id=${emptyCart.id}`,
            emptyCart
          );
        } else {
          this.saveCartToLocal(emptyCart);
          return of(emptyCart);
        }
      })
    );
  }

  //Update cart
  updateCart(updatedCart: Cart): Observable<Cart> {
    return this.http.put<Cart>(
      `${this.urlBase}/${updatedCart.id}`,
      updatedCart
    );
  }

  //Obtener detalle productos
  getProductDetails(id: string | null): Observable<Product> {
    return this.http.get<Product>(`${this.urlProducts}?id=${id}`);
  }

  // Sincronizar carrito local con back al loguearse
  syncCartWithBackend(clerk_user_id: string): Observable<any> {
    return forkJoin({
      backend: this.getCartBackend(clerk_user_id),
      local: of(this.getCartLocal()),
    }).pipe(
      switchMap(({ backend, local }) => {
        const backendProducts = Array.isArray(backend.products)
          ? backend.products
          : [];
        const localProducts = Array.isArray(local.products)
          ? local.products
          : [];

        // Ambos tienen productos
        if (backend.products.length > 0 && local.products.length > 0) {
          // Por ahora, fusionamos automáticamente:
          const productosFusionados = this.fusionarCarritos(
            backend.products,
            local.products
          );
          return this.sendMergedCart(clerk_user_id, productosFusionados).pipe(
            tap(() => localStorage.removeItem(this.localStorageKey))
          ); // Si fue exitosa la sinc, elimino el local
        } else if (local.products.length > 0) {
          // Solo local: subirlo
          return this.sendMergedCart(clerk_user_id, local.products).pipe(
            tap(() => localStorage.removeItem(this.localStorageKey))
          ); // Si funco la sinc de local y subio al back elimino
        } else if (backend.products.length > 0) {
          // Solo back: ya está sincronizado, no subo nada
          return of({ success: true, message: 'Carrito ya está sincronizado' });
        } else {
          // Ambos vacíos: nada que hacer
          return of({ success: true, message: 'Carrito vacío' });
        }
      })
    );
  }

  // Fusión de productos por id (se suma cantidad si ya existe)
  fusionarCarritos(backendCart: CartItem[], localCart: CartItem[]): CartItem[] {
    const mergedMap = new Map<string, CartItem>();

    // Agregamos todos los productos del backend
    backendCart.forEach((item) => {
      mergedMap.set(item.product_id, { ...item });
    });

    // Fusionamos con los del local
    localCart.forEach((item) => {
      if (mergedMap.has(item.product_id)) {
        // Si existe, sumo cantidades
        const prev = mergedMap.get(item.product_id)!;
        mergedMap.set(item.product_id, {
          ...prev,
          quantity: prev.quantity + item.quantity,
        });
      } else {
        mergedMap.set(item.product_id, { ...item });
      }
    });

    return Array.from(mergedMap.values());
  }

  // Obtener carrito del back (sin verificar login)
  getCartBackend(clerk_user_id: string): Observable<Cart> {
    return this.http
      .get<Cart>(`${this.urlBase}?clerk_user_id=${clerk_user_id}`)
      .pipe(
        map(
          (cart) =>
            cart || {
              id: '',
              idUser: clerk_user_id,
              totalAmount: 0,
              products: [],
            }
        )
      );
  }

  // Obtener carrito del localStorage
  getCartLocal(): Cart {
    try {
      const data = localStorage.getItem(this.localStorageKey);
      const cart = data ? JSON.parse(data) : null;
      return cart && Array.isArray(cart.products)
        ? cart
        : { id: '', idUser: '', totalAmount: 0, products: [] };
    } catch {
      return { id: '', idUser: '', totalAmount: 0, products: [] };
    }
  }

  // Envía el carrito fusionado al backend
  private sendMergedCart(
    clerk_user_id: string,
    productos: CartItem[]
  ): Observable<any> {
    const items = productos.map((i) => ({
      product_id: i.product_id,
      quantity: i.quantity,
    }));
    return this.http.post(`${this.urlBase}`, {
      clerk_user_id,
      items,
    });
  }
}
