import { inject } from "@angular/core";
import { Observable, map, tap } from "rxjs";
import { AuthService } from "../service/auth.service";
import { Router } from "@angular/router";

function checkAuthStatus(): boolean | Observable<boolean>{
    const authService = inject(AuthService);
    const  router = inject(Router);
    return authService.checkStatusAutentication()
                      .pipe(
                        tap( isAuthenticated => {
                          if(isAuthenticated){
                            router.navigate(['/private'])
  
                          }
                        }),
                        map(isAuthenticated => !isAuthenticated)
                      )
  }


  
  export const LoginGuard = () => {
    return checkAuthStatus()
  }