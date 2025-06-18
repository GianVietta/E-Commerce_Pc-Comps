import { Component, OnInit, inject } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css',
})
export class ProfileComponent implements OnInit {
  fb: FormBuilder = inject(FormBuilder);
  isEditing = false;
  //Clerk para el usuario
  clerkUser: any = null;

  form: FormGroup = this.fb.group({
    dni: ['', [Validators.required, Validators.pattern(/^\d{7,8}$/)]],
    phoneNumber: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
    address: ['', Validators.required],
    name: ['', [Validators.required, Validators.minLength(3)]],
    lastName: ['', Validators.required],
  });

  ngOnInit(): void {
    this.clerkUser = window.Clerk?.user;
    this.setValuesForm();
    this.form.disable(); //Desabilito el form al arrancar
  }

  setValuesForm() {
    if (this.clerkUser) {
      this.form.patchValue({
        dni: this.clerkUser.publicMetadata?.['dni'] || '',
        phoneNumber: this.clerkUser.publicMetadata?.['phoneNumber'] || '',
        address: this.clerkUser.publicMetadata?.['adress'] || '',
        name: this.clerkUser.firstName || '',
        lastName: this.clerkUser.lastName || '',
      });
    }
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
    const clerkUser = window.Clerk?.user;

    if (!clerkUser) {
      console.error(
        'Usuario no disponible. Reintenta o volve a iniciar sesion'
      );
      return;
    }
    // Actualiza los datos editables en Clerk
    clerkUser
      .update({
        firstName: this.form.value.name,
        lastName: this.form.value.lastName,
        publicMetadata: {
          dni: this.form.value.dni,
          phoneNumber: this.form.value.phoneNumber,
          address: this.form.value.address,
        },
      } as any)
      .then((updatedUser: any) => {
        // Actualiza el form y sale del modo edición
        this.clerkUser = updatedUser;
        this.toggleEdit();
        this.setValuesForm();
        console.log('Usuario actualizado correctamente');
      })
      .catch((error: any) => {
        console.error('Error al actualizar el usuario:', error);
      });
  }
}
