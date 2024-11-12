import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment.development';
import { User } from '../interface/auth';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, catchError, map, of, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  urlBase = environment.urlUsers
  public user ?: User 
  private authStatusSubject = new BehaviorSubject<boolean>(false);
  
  constructor(private http: HttpClient, private router: Router) {
    // Verificar estado inicial de autenticación
    this.checkStatusAutentication().subscribe();
  }

  // Observable para cambios en el estado de autenticación
  authStatusChanges(): Observable<boolean> {
    return this.authStatusSubject.asObservable();
  }

  get currentUser(): User | undefined {
    if (!this.user) return undefined;
    return structuredClone(this.user);
  }


  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.urlBase)
  }
  postUser(user : User): Observable<User>{
    return this.http.post<User>(this.urlBase,user);
  }

  verifyUserAndPass(email: string, pass: string) {
    return this.getUsers().pipe(
      map(users => {
        const user = users.find(u => u.password === pass && u.email === email);
        if (user) {
          this.user = user;
          localStorage.setItem('token', user.id.toString());
          return true;
        }
        return false;
      }),
      tap(isAuthenticated => {
        if (isAuthenticated) {
          this.router.navigate(['']);
        }
      })
    );
  }

  checkEmailExist(email : string): Observable <Boolean>{
    return this.getUsers().pipe(
      map(users => users.some(user => user.email === email)),
      catchError(() => of(false))
    );
  }

  checkStatusAutentication(): Observable<boolean> {
    const token = localStorage.getItem('token');
    if (!token) {
      return of(false)
    }
    return this.http.get<User>(`${this.urlBase}/${token}`)
      .pipe(
        tap(u =>{
          this.user = u
          this.authStatusSubject.next(!!u);
        } ),
        map(u => !!u),
        catchError(() => {
          this.authStatusSubject.next(false);
          return of(false);
        })
      )
  }

  checkEmailExists(email: string): Observable<boolean> {
    return this.getUsers().pipe(
      map(users => users.some(user => user.email === email)),
      catchError(() => of(false)) 
    );
  }

  logout() {
    this.user = undefined;
    localStorage.clear()
    this.authStatusSubject.next(false);
  }

}
