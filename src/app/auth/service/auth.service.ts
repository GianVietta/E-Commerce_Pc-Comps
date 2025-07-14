import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment.development';
import { User } from '../interface/user';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  urlBase = environment.urlUsers;
  http = inject(HttpClient);

  /** Trae un usuario de la DB por clerk_user_id */
  getUserByClerkId(clerk_user_id: string): Observable<User | undefined> {
    return this.http
      .get<User>(`${this.urlBase}?clerk_user_id=${clerk_user_id}`)
      .pipe(catchError(() => of(undefined)));
  }

  /** Crea usuario en la DB (solo si no existe) */
  createUser(user: User): Observable<any> {
    return this.http.post<any>(this.urlBase, user);
  }

  /** Actualiza usuario por clerk_user_id */
  updateUser(user: Partial<User> & { clerk_user_id: string }): Observable<any> {
    return this.http.put<any>(
      `${this.urlBase}?clerk_user_id=${user.clerk_user_id}`,
      user
    );
  }

  /** Opcional: Elimina usuario de tu DB (por id interno) */
  deleteUser(id: number): Observable<any> {
    return this.http.delete<any>(`${this.urlBase}?id=${id}`);
  }
}
