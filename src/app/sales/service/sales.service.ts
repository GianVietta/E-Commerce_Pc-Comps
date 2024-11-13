import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '../../../environments/environment.development';
import { Sales } from '../interface/sales';
import { Observable } from 'rxjs';
import { Product } from '../../product/interface/product';

@Injectable({
  providedIn: 'root'
})
export class SalesService {
  private http= inject(HttpClient);
  private urlBase= environment.urlSales;
  private urlProduct= environment.urlProducts;

  //Crear venta 
  addSale(sale: Sales): Observable<Sales>{
    return this.http.post<Sales>(this.urlBase,sale);
  }
  //Obtener todas las ventas
  getSales(): Observable<Sales[]>{
    return this.http.get<Sales[]>(this.urlBase);
  }
  //Obtener venta de un id 
  getSaleById(id:string):Observable<Sales>{
    return this.http.get<Sales>(`${this.urlBase}/${id}`);
  }
  //Obtener venta de un id de usuario
  getSalesByUserId(idUser: string): Observable<Sales[]>{
    return this.http.get<Sales[]>(`${this.urlBase}?idUser=${idUser}`);
  }
  //Borrar venta 
  deleteSale(id: string):Observable<void>{
    return this.http.delete<void>(`${this.urlBase}/${id}`);
  }
  //Obtener detalle productos
  getProductDetails(idProduct: string): Observable<Product>{
    return this.http.get<Product>(`${this.urlProduct}/${idProduct}`);
  }
}
