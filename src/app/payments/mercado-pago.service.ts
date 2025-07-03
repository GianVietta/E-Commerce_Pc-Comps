import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment.development';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class MercadoPagoService {
  private http = inject(HttpClient);
  private urlBase = environment.urlMPago;

  createPreference(data: any): Observable<any> {
    return this.http.post<any>(this.urlBase, data, {
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
