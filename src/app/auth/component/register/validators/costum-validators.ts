import { ValidationErrors, Validators,ValidatorFn, AbstractControl, AsyncValidatorFn } from "@angular/forms";
import { AuthService } from "../../../service/auth.service";
import { Observable, catchError, debounceTime, map, of } from "rxjs";

export class CustomValidators extends Validators{

    static mustBeEquals(password: string , confirmPassword : string) : ValidatorFn | null{
        return (group : AbstractControl) : ValidationErrors | null =>{
            const primerControl = group.get(password)
            const segundoControl = group.get(confirmPassword)
            return primerControl?.value === segundoControl?.value ? null : { mustBeEquals : true }
        }
    }

    static emailExists(authService: AuthService): AsyncValidatorFn {
        return (control: AbstractControl): Observable<ValidationErrors | null> => {
          if (!control.value) {
            return of(null);  // Si no hay valor, no validar
          }
          
          return authService.checkEmailExists(control.value).pipe(
            debounceTime(500), // Tiempo para esperar después de que el usuario deje de escribir
            map(exists => exists ? { emailExists: true } : null), // Si el email existe, retorna el error
            catchError(() => of(null)) // Manejo de errores, siempre retorna null en caso de error
          );
        };
      }
      static emailNotExists(authService: AuthService): AsyncValidatorFn {
        return (control: AbstractControl): Observable<ValidationErrors | null> => {
          if (!control.value) {
            return of(null);  // Si no hay valor, no validar
          }
          
          return authService.checkEmailExists(control.value).pipe(
            debounceTime(500), // Tiempo para esperar después de que el usuario deje de escribir
            map(exists => exists ? { emailExists: false } : null), // Si el email existe, retorna el error
            catchError(() => of(null)) // Manejo de errores, siempre retorna null en caso de error
          );
        };
      }

}