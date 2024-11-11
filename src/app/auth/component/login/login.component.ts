import { Component, OnInit, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import {MatButtonModule} from '@angular/material/button';
import {MatInputModule} from '@angular/material/input';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../service/auth.service';
import { Router } from '@angular/router';
import { User } from '../../interface/auth';
import { RegisterComponent } from '../register/register.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [MatDialogModule,MatButtonModule,MatInputModule,ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  constructor( public dialog : MatDialog){}
  
  data = inject(MAT_DIALOG_DATA);
  readonly dialogRef = inject(MatDialogRef<LoginComponent>);
  private fb : FormBuilder = inject(FormBuilder);
  private auth: AuthService = inject(AuthService)
  private router: Router = inject(Router)

  form : FormGroup = this.fb.group({
    email : ['', [Validators.required,Validators.email]],
    password : ['', [Validators.required, Validators.minLength(4)]]
  })

  user : User | undefined; 

  iniciarSession() {
    if (this.form.invalid) return;

    this.auth.verifyUserAndPass(
      this.form.controls['email'].value,
      this.form.controls['password'].value).subscribe(isAuthenticated => {
        if (isAuthenticated) {
         this.user= this.auth.currentUser;
          console.log("Usuario autenticado correctamente");
        } else {
          console.log("Credenciales incorrectas");        }
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
      position : { top : '50px'},
      width : '1200px',
      data : {
        tipo : 'REGISTER'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log(`Dialog result: ${result}`);
    });
  }
}
