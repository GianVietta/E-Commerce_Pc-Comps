import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class PayPalService {

  constructor(private http: HttpClient) { }

  private apiUrl = 'http://localhost:4000';  // URL base para las rutas de PayPal en el backend

  // Método para crear una orden en el backend
  createOrder(orderData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/create-order`, orderData);
  }

  // Método para capturar una orden en el backend
  captureOrder(token: string, userId:string): Observable<any> {
    return this.http.post(`${this.apiUrl}/capture-order`, { params: { token,userId } });
  }
}

