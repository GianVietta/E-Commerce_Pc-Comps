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
  //Cuento el total de ventas o compras

  //Obtener ventas paginadas para optimizar consulta
  //Originalmente se podia filtrar por fecha a fecha
  //pero no me gusto asi que le mande global search
  getSalesPaginated(
    options: {
      page?: number;
      limit?: number;
      order_by?: string;
      order?: 'asc' | 'desc';
      search?: string;
      clerk_user_id?: string; // Asi manejo el retorno solo para ese user
    } = {}
  ): Observable<Sales[]> {
    const params = new URLSearchParams();
    if (options.page) params.set('page', options.page.toString());
    if (options.limit) params.set('limit', options.limit.toString());
    if (options.order_by) params.set('order_by', options.order_by);
    if (options.order) params.set('order', options.order);
    if (options.search) params.set('search', options.search);
    if (options.clerk_user_id)
      params.set('clerk_user_id', options.clerk_user_id);

    return this.http.get<Sales[]>(`${this.urlBase}?${params.toString()}`);
  }

  // Obtener el total de ventas/compras (con filtros)
  getSalesCount(
    options: {
      from_date?: string;
      to_date?: string;
      user_name?: string;
      clerk_user_id?: string;
    } = {}
  ): Observable<{ total: number }> {
    const params = new URLSearchParams();
    params.set('action', 'count');
    if (options.from_date) params.set('from_date', options.from_date);
    if (options.to_date) params.set('to_date', options.to_date);
    if (options.user_name) params.set('user_name', options.user_name);
    if (options.clerk_user_id)
      params.set('clerk_user_id', options.clerk_user_id);

    return this.http.get<{ total: number }>(
      `${this.urlBase}?${params.toString()}`
    );
  }
}
