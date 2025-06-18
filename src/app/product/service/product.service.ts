import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Product } from '../interface/product';
import { environment } from '../../../environments/environment.development';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  urlBase = environment.urlProducts;

  constructor(private http: HttpClient) {}

  // Obtener todos los productos
  getProduct(): Observable<Product[]> {
    return this.http.get<Product[]>(this.urlBase);
  }

  // Obtener un solo producto por su id
  getProductByid(id: string | null): Observable<Product> {
    return this.http.get<Product>(`${this.urlBase}?id=${id}`);
  }

  // Crear producto
  postProduct(product: Product): Observable<any> {
    return this.http.post<any>(this.urlBase, product);
  }

  // Actualizar un producto
  putProduct(updateProduct: Product, id: String | null): Observable<any> {
    return this.http.put<any>(`${this.urlBase}?id=${id}`, updateProduct);
  }

  // Eliminar un producto
  deleteProduct(id: string): Observable<any> {
    return this.http.delete<any>(`${this.urlBase}?id=${id}`);
  }
}
