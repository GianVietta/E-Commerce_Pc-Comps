import { Component, OnInit, inject } from '@angular/core';
import { User } from '../../interface/auth';
import { AuthService } from '../../service/auth.service';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CustomValidators } from '../register/validators/costum-validators';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [ReactiveFormsModule,CommonModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent  implements OnInit{
  
  authService = inject(AuthService);
  fb: FormBuilder = inject(FormBuilder);
  isEditing = false;
  user: User | undefined;
  
  form: FormGroup = this.fb.group({
    dni: ['', [Validators.required, Validators.pattern(/^\d{7,8}$/)]],
    phoneNumber: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
    address: ['', Validators.required],
    name: ['', [Validators.required, Validators.minLength(3)]],
    lastName: ['', Validators.required]
  });
  
  ngOnInit(): void {
    // Obtener el usuario actual de manera asíncrona y luego establecer los valores en el formulario
    this.authService.authStatusChanges().subscribe(() => {
      this.user = this.authService.currentUser;
      this.setValuesForm();
    });
  }

  setValuesForm() {
    if (this.user) {
      this.form.patchValue({
        dni: this.user.person.dni,
        phoneNumber: this.user.person.phoneNumber,
        address: this.user.person.address,
        name: this.user.person.name,
        lastName: this.user.person.lastName
      });
    }
    this.form.disable(); // Deshabilitar el formulario inicialmente
  }

  toggleEdit() {
    this.isEditing = !this.isEditing;
    if (this.isEditing) {
      this.form.enable(); // Habilitar el formulario para edición
    } else {
      this.form.disable(); // Deshabilitar el formulario al salir del modo edición
    }
  }

  update() {
    if (this.form.invalid) return;
    
    const updatedUser: User = {
      ...this.user!,
      person: {
        ...this.user!.person,
        ...this.form.value
      }
    };

    this.authService.putUser(updatedUser, updatedUser.id).subscribe({
      next: (user: User) => {
        this.user = user; 
        this.toggleEdit();
        console.log("Usuario actualizado con éxito:", user);
      },
      error: (error) => {
        console.error("Error al actualizar el usuario:", error);
      }
    });
  }
}