import { Component, OnInit, inject } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { User } from '../../interface/user';
import { AuthService } from '../../service/auth.service';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CommonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
  ],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css',
})
export class ProfileComponent implements OnInit {
  fb: FormBuilder = inject(FormBuilder);
  userService = inject(AuthService);
  snackBar = inject(MatSnackBar);

  isEditing = false;
  loading = false;

  //Clerk para el usuario
  clerkUser: any = null;
  userDB: User | undefined;

  form: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(3)]],
    last_name: ['', Validators.required],
    dni: ['', [Validators.required, Validators.pattern(/^\d{7,8}$/)]],
    phone_number: [
      '',
      [Validators.required, Validators.pattern(/^[0-9]{10}$/)],
    ],
    address: ['', Validators.required],
  });

  ngOnInit(): void {
    this.clerkUser = window.Clerk?.user;
    const clerk_user_id = this.clerkUser?.id;

    // Si no esta logueado, lo bloqueo
    if (!clerk_user_id) return;

    this.loading = true;
    this.userService.getUserByClerkId(clerk_user_id).subscribe(
      (user) => {
        this.userDB = user;
        // Si el usuario existe, rellenar el form
        if (user) {
          this.form.patchValue({
            name: user.name ?? '',
            last_name: user.last_name ?? '',
            dni: user.dni ?? '',
            phone_number: user.phone_number ?? '',
            address: user.address ?? '',
          });
          this.form.disable();
        } else {
          // No existe: crear un user en la DB y rellenar el form
          const newUser: User = {
            clerk_user_id,
            name: '',
            last_name: '',
            dni: '',
            phone_number: '',
            address: '',
          };
          this.userService.createUser(newUser).subscribe({
            next: () => {
              // Vuelvo a consultar a la DB para asegurarme de tener el objeto con su ID y todos los campos como están guardados
              this.userService
                .getUserByClerkId(clerk_user_id)
                .subscribe((userCreated) => {
                  this.userDB = userCreated;
                  this.form.patchValue({
                    name: userCreated?.name ?? '',
                    last_name: userCreated?.last_name ?? '',
                    dni: userCreated?.dni ?? '',
                    phone_number: userCreated?.phone_number ?? '',
                    address: userCreated?.address ?? '',
                  });
                });
            },
            error: () => {
              this.snackBar.open(
                'Error al crear usuario, intentá recargar la página',
                'Cerrar',
                { duration: 3500 }
              );
            },
          });
        }
        this.form.disable();
        this.loading = false;
      },
      () => {
        this.loading = false;
      }
    );
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
    if (this.form.invalid || !this.clerkUser?.id) {
      this.snackBar.open(
        'Completa los campos obligatorios correctemente',
        'Cerrar',
        { duration: 3500 }
      );
      return;
    }
    const data = {
      clerk_user_id: this.clerkUser.id,
      ...this.form.value,
    };
    this.loading = true;

    this.userService.updateUser(data).subscribe({
      next: () => {
        this.toggleEdit();
        this.snackBar.open('Datos guardados correctamente', 'Cerrar', {
          duration: 2500,
        });
        this.loading = false;
      },
      error: () => {
        this.snackBar.open('Error al guardar datos', 'Cerrar', {
          duration: 2500,
        });
        this.loading = false;
      },
    });
  }
}
