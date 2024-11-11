import { Component, EventEmitter, Output, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import {MatButtonModule} from '@angular/material/button';
import {MatInputModule} from '@angular/material/input';
import {AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, Validators} from '@angular/forms';
import { AuthService } from '../../service/auth.service';
import { Router } from '@angular/router';
import { map } from 'rxjs';
import { User } from '../../interface/auth';
import { CustomValidators } from './validators/costum-validators';
import { CommonModule } from '@angular/common';



@Component({
  selector: 'app-register',
  standalone: true,
  imports: [MatDialogModule,MatButtonModule,MatInputModule,ReactiveFormsModule,CommonModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {

  @Output()
  emitirUsuario : EventEmitter<User> = new EventEmitter()

  data = inject(MAT_DIALOG_DATA);
  readonly dialogRef = inject(MatDialogRef<RegisterComponent>);
  
  private fb : FormBuilder = inject(FormBuilder);
  private auth: AuthService = inject(AuthService)
  private router: Router = inject(Router)

  form: FormGroup = this.fb.group({
    id: [''],
    email: ['', [Validators.required, Validators.email],[CustomValidators.emailExists(this.auth)]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', [Validators.required]],
    dni: ['', [Validators.required, Validators.pattern(/^\d{7,8}$/)]],
    phoneNumber: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
    address: ['', Validators.required],
    name: ['', [Validators.required, Validators.minLength(3)]],
    lastName: ['', Validators.required]
  },
  {
    validators : CustomValidators.mustBeEquals('password','confirmPassword')
  }
  );




  register() {
    if (this.form.invalid) return;

    const user: User = {
      id: crypto.randomUUID(),
      password: this.form.controls['password'].value,
      email:  this.form.controls['email'].value,
      person: {
        address:  this.form.controls['address'].value,
        phoneNumber:  this.form.controls['phoneNumber'].value,
        dni:  this.form.controls['dni'].value,
        name:  this.form.controls['name'].value,
        lastName:  this.form.controls['lastName'].value
      }
    };
    this.emitirUsuario.emit(structuredClone(user));
    localStorage.setItem('token', user.id.toString());
    this.auth.postUser(user).subscribe(() => {
      console.log('Usuario registrado correctamente');
      this.dialogRef.close();
    });
  }

  cancelar(){
      this.dialogRef.close();
  }
  
  
}
