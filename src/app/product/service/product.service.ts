import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Product } from '../interface/product';
import { environment } from '../../../environments/environment.development';
import { Observable } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class ProductService {

  urlBase=environment.urlProducts;

  constructor(private http:HttpClient) { }

  getProduct():Observable<Product[]>{
    return this.http.get<Product[]>(this.urlBase);
  }

  getProductByid(id:string | null):Observable<Product>{
    return this.http.get<Product>(`${this.urlBase}/${id}`);
  }

  postProduct(product:Product):Observable<Product>{
    return this.http.post<Product>(this.urlBase,product);
  }

  putProduct(updateProduct:Product, id:String | null):Observable<Product>{
    return this.http.put<Product>(`${this.urlBase}/${id}`,updateProduct);
  }

  deleteProduct(id:string):Observable<void>{
    return this.http.delete<void>(`${this.urlBase}/${id}`);
  }


}
