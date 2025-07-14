import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  inject,
  Output,
  ViewEncapsulation,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ProductService } from '../../service/product.service';
import { Product } from '../../interface/product';
import { v4 as uuidv4} from 'uuid';
import { Router } from '@angular/router';

@Component({
  selector: 'app-new-product',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './new-product.component.html',
  styleUrl: './new-product.component.css',
  encapsulation: ViewEncapsulation.Emulated,
})
export class NewProductComponent {
  categorias = [
    'CPU',
    'MotherBoard',
    'RAM',
    'Tarjeta de video',
    'Almacenamiento',
    'Fuente',
    'Refrigeracion',
    'Gabinete',
  ];

  @Output()
  eventEmitter: EventEmitter<Product> = new EventEmitter();

  fb = inject(FormBuilder);
  ps = inject(ProductService);
  router = inject(Router);
  successMessage: string | null = null;

  form = this.fb.nonNullable.group({
    id: [],
    name: [``, [Validators.required, Validators.minLength(3)]],
    price: [0, [Validators.required, Validators.pattern('^[0-9]+$')]],
    brand: [``, [Validators.required, Validators.minLength(3)]],
    description: [``, [Validators.required, Validators.minLength(30)]],
    category: [``, Validators.required],
    stock: [0, [Validators.required, Validators.pattern('^[0-9]+$')]],
    img: [
      ``,
      [
        Validators.required,
        Validators.pattern('https?://.+\\.(jpg|jpeg|png|gif|svg)'),
      ],
    ],
  });

  cancelar() {
    this.router.navigateByUrl('/');
  }

  addProduct() {
    if (this.form.invalid) {
      console.log(this.form.invalid);
      return;
    }
    const product: Product = this.form.getRawValue();
    product.id = uuidv4();
    this.saveProduct(product);
    this.eventEmitter.emit({ ...product });
    this.form.reset();
  }
  saveProduct(product: Product) {
    this.ps.postProduct(product).subscribe({
      next: (product: Product) => {
        this.successMessage = '¡Producto agregado correctamente!';
        setTimeout(() => {
          this.successMessage = null;
        }, 2500); // 2.5 segundos
        console.log('Agregado Correctamente');
      },
      error: (e: Error) => {
        console.log(e.message);
      },
    });
  }
}
