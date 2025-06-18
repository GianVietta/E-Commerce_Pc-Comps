import { Component, inject, OnInit } from '@angular/core';
import { Product } from '../../interface/product';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ProductService } from '../../service/product.service';
import { CommonModule } from '@angular/common';
import { CartService } from '../../../cart/service/cart.service';

@Component({
  selector: 'app-serch-product',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './serch-product.component.html',
  styleUrl: './serch-product.component.css',
})
export class SerchProductComponent implements OnInit {
  products: Product[] = [];
  query: string = '';
  isAdmin = false;
  route = inject(ActivatedRoute);
  productService = inject(ProductService);
  cs = inject(CartService);

  ngOnInit(): void {
    //Verifica si es admin con clerk
    const user = window.Clerk?.user;
    this.isAdmin = user?.publicMetadata?.['isAdmin'] === true;

    this.route.queryParams.subscribe((params) => {
      this.query = params['query'];
      this.searchProducts();
    });
  }

  searchProducts() {
    //console.log(this.query);
    this.productService.getProduct().subscribe((products) => {
      // Filtrar productos por nombre o marca
      this.products = products.filter(
        (product) =>
          product.name.toLowerCase().includes(this.query.toLowerCase()) ||
          product.brand.toLowerCase().includes(this.query.toLowerCase())
      );
      this.products.sort((a, b) => b.stock - a.stock);
    });
  }

  addToCart(productId: string) {
    //Obtener el producto por su ID
    this.productService.getProductByid(productId).subscribe({
      next: (product: Product) => {
        //Buscar si el producto existe en el carrito
        this.cs.getCart().subscribe({
          next: (cart) => {
            // Buscar si el producto ya está en el carrito
            const existingCartItem = cart.products.find(
              (item) => item.product_id === productId
            );
            // Si el producto ya está en el carrito, validar que no exceda el stock
            const currentQuantity = existingCartItem
              ? existingCartItem.quantity
              : 0;
            //Validar si agregar una unidad mas excede el stock
            if (currentQuantity + 1 > product.stock) {
              window.alert(
                'No se pueden agregar mas productos, porque supera el stock disponible. '
              );
              console.warn(
                'No se pueden agregar mas productos, porque supera el stock disponible. '
              );
              return;
            }
            //Si hay suficiente stock, agregar el producto al carrito
            this.cs.addProductToCart(productId, 1).subscribe({
              next: () => {
                console.log('Agregado Correctamente');
              },
              error: (e: Error) => {
                console.log(e.message);
              },
            });
          },
          error: (e: Error) => {
            console.error('Error al obtener el carrito: ', e.message);
          },
        });
      },
      error: (e: Error) => {
        console.error('Error al obtener el producto: ', e.message);
      },
    });
  }

  removeProduct(product: Product) {
    if (confirm('Seguro que deseas eliminar ' + `${product.name}`)) {
      this.productService.deleteProduct(product.id).subscribe(() => {
        window.location.reload(); // Recarga toda la página
      });
      alert(`${product.name}` + ' Fue eliminado satisfactoriamente.');
    } else {
      console.log('eliminacion cancelada');
    }
  }
}
