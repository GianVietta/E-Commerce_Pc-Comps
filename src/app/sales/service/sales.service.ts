import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '../../../environments/environment.development';
import { Sales } from '../interface/sales';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SalesService {
  private http = inject(HttpClient);
  private urlBase = environment.urlSales;

  //Crear venta
  addSale(
    clerk_user_id: string,
    cart_id: string
  ): Observable<{ success: boolean; sale_id?: string; error?: any }> {
    return this.http.post<any>(`${this.urlBase}`, { clerk_user_id, cart_id });
  }
  //Obtener todas las ventas
  getSales(): Observable<Sales[]> {
    return this.http.get<Sales[]>(this.urlBase);
  }
  //Obtener venta de un id
  getSaleById(id: string): Observable<Sales> {
    return this.http.get<Sales>(`${this.urlBase}?id=${id}`);
  }
  //Obtener venta de un id de usuario
  getSalesByUserId(clerk_user_id: string): Observable<Sales[]> {
    return this.http.get<Sales[]>(
      `${this.urlBase}?clerk_user_id=${clerk_user_id}`
    );
  }
}
