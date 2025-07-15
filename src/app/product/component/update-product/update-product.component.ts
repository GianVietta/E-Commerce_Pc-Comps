import { Component, OnInit, ViewEncapsulation, inject } from '@angular/core';
import { Product } from '../../interface/product';
import { ProductService } from '../../service/product.service';
import { ActivatedRoute } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NotificationServiceService } from '../../../notification/notification-service.service';

@Component({
  selector: 'app-update-product',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './update-product.component.html',
  styleUrls: ['./update-product.component.css'],
  encapsulation: ViewEncapsulation.Emulated,
})
export class UpdateProductComponent implements OnInit {
  product: Product | null = null;
  productService = inject(ProductService);
  fb: FormBuilder = inject(FormBuilder);
  isEditing = false;
  ns = inject(NotificationServiceService);
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

  form: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(3)]],
    price: [
      0,
      [Validators.required, Validators.pattern('^[0-9]+$'), Validators.min(1)],
    ],
    brand: ['', Validators.required],
    description: ['', Validators.required],
    category: ['', Validators.required],
    stock: [
      0,
      [Validators.required, Validators.pattern('^[0-9]+$'), Validators.min(1)],
    ],
    img: ['', Validators.required],
  });

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    const productId = this.route.snapshot.paramMap.get('id');
    if (productId) {
      this.productService.getProductByid(productId).subscribe({
        next: (product) => {
          this.product = product;
          this.setValuesForm();
        },
      });
    }
  }

  setValuesForm() {
    if (this.product) {
      this.form.patchValue({
        name: this.product.name,
        price: this.product.price,
        brand: this.product.brand,
        description: this.product.description,
        category: this.product.category,
        stock: this.product.stock,
        img: this.product.img,
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

    const updatedProduct: Product = {
      ...this.product!,
      ...this.form.value,
    };

    this.productService
      .putProduct(updatedProduct, updatedProduct.id)
      .subscribe({
        next: (product: Product) => {
          this.product = product;
          this.toggleEdit();
          this.ns.show('Producto actualizado correctamente', 'success');
          console.log('Agregado Correctamente');
        },
        error: (error) => {
          this.ns.show('Error al actualizar el producto', 'error');
          console.error('Error al actualizar el producto:', error);
        },
      });
  }
}
