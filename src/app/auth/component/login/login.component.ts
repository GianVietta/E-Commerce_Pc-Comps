import { Component, OnInit, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import {MatButtonModule} from '@angular/material/button';
import {MatInputModule} from '@angular/material/input';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../service/auth.service';
import { Router } from '@angular/router';
import { User } from '../../interface/auth';
import { RegisterComponent } from '../register/register.component';
import { CommonModule } from '@angular/common';
import { CustomValidators } from '../register/validators/costum-validators';
import { Overlay } from '@angular/cdk/overlay';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [MatDialogModule,MatButtonModule,MatInputModule,ReactiveFormsModule,CommonModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {

  errorMessage: string | null = null;
  constructor( public dialog : MatDialog, private overlay: Overlay){}
  
  data = inject(MAT_DIALOG_DATA);
  readonly dialogRef = inject(MatDialogRef<LoginComponent>);
  private fb : FormBuilder = inject(FormBuilder);
  private auth: AuthService = inject(AuthService)
  private router: Router = inject(Router)

  form : FormGroup = this.fb.group({
    email : ['', [Validators.required,Validators.email]],//poner validacion email existente 
    password : ['', [Validators.required]]
  })

  user : User | undefined; 

  iniciarSession() {
  
    if (this.form.invalid) return;

    this.auth.verifyUserAndPass(
      this.form.controls['email'].value,
      this.form.controls['password'].value).subscribe(isAuthenticated => {
        if (isAuthenticated) {
         this.user= this.auth.currentUser;
         this.errorMessage = null;
          console.log("Usuario autenticado correctamente");
          this.dialogRef.close();
          window.location.reload();
        } else {
          this.errorMessage = 'Credenciales incorrectas. Por favor, verifica tu email y contraseña.';
          console.log("Credenciales incorrectas"); 
               }
      });

  }
  

  cancelar(){
    this.dialogRef.close();
  }

  openRegisterDialog(){
    const dialogRef = this.dialog.open(RegisterComponent,{
      disableClose : true , 
      autoFocus: true ,
      closeOnNavigation : false ,
      scrollStrategy: this.overlay.scrollStrategies.reposition(),
      width : '600px',
      data : {
        tipo : 'REGISTER'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log(`Dialog result: ${result}`);
    });
  }
}
