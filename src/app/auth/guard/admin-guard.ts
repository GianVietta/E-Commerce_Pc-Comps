import { inject } from "@angular/core";
import { Observable, tap } from "rxjs";
import { AuthService } from "../service/auth.service";
import { Router } from "@angular/router";
import { User } from "../interface/auth";

function checkAuthStatus(): boolean | Observable<boolean>{
    const authService = inject(AuthService);
    const  router = inject(Router);
    const user:User | undefined = authService.currentUser
  
    return authService.checkStatusAutentication()
                    .pipe(
                        tap( isAdmin => {
                        if(!(user?.id==='1')) router.navigate([''])
                        } )
                    )
  }
  
  export const AdminGuard = () => {
    return checkAuthStatus()
  }