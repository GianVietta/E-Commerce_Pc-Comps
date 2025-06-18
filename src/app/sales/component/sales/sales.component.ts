import { Router } from '@angular/router';
import { Component, inject, OnInit, ViewEncapsulation } from '@angular/core';
import { Sales } from '../../interface/sales';
import { SalesService } from '../../service/sales.service';
import { CommonModule } from '@angular/common';
import { Product } from '../../../product/interface/product';
import { ProductService } from '../../../product/service/product.service';

@Component({
  selector: 'app-sales',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sales.component.html',
  styleUrl: './sales.component.css',
  encapsulation: ViewEncapsulation.Emulated,
})
export class SalesComponent implements OnInit {
  ss = inject(SalesService);
  ps = inject(ProductService);
  listSales: Sales[] = [];
  userId: string | undefined;
  isAdmin: boolean = false;
  router = inject(Router);
  // Cache de productos
  productCache: { [id: string]: Product } = {};

  ngOnInit(): void {
    const user = window.Clerk?.user;
    if (!user) {
      //Usuario no autenticado, mando al home
      this.router.navigate(['/']);
      return;
    }
    this.userId = user.id;
    this.isAdmin = user.publicMetadata?.['isAdmin'] === true;

    this.loadSalesByUser();
  }

  loadSalesByUser(): void {
    if (this.isAdmin) {
      this.loadAllSales();
    } else if (this.userId) {
      this.loadSalesByUserID();
    }
  }

  loadAllSales() {
    this.ss.getSales().subscribe({
      next: (sales: Sales[]) => {
        // Mapeo para ajustar los nombres de campos al formato esperado por el HTML
        this.listSales = sales.map((sale) => ({
          ...sale,
          id: sale.id, // importante para eliminar
          clerk_user_id: sale.clerk_user_id,
          total_Amount: Number(sale.total_amount), // convierte a número
          created_at: sale.created_at,
          products: sale.products,
        }));
        if (sales && sales.length > 0) {
          this.loadAllProductForSales(sales);
        } else {
          console.warn('No hay ventas disponibles. ');
        }
      },
      error: (e: Error) => {
        console.log(e.message);
        alert('Error al cargar las ventas. ');
      },
    });
  }

  loadSalesByUserID() {
    this.ss.getSalesByUserId(this.userId!).subscribe({
      next: (sales: Sales[]) => {
        // Mapeo para ajustar los nombres de campos al formato esperado por el HTML
        this.listSales = sales.map((sale) => ({
          ...sale,
          id: sale.id, // importante para eliminar
          clerk_user_id: sale.clerk_user_id,
          total_Amount: Number(sale.total_amount), // convierte a número
          created_at: sale.created_at,
          products: sale.products,
        }));
        if (sales && sales.length > 0) {
          this.loadAllProductForSales(sales);
        } else {
          console.warn('No hay compras para este usuario. ');
        }
      },
      error: (e: Error) => {
        console.log(e.message);
        alert('Error al cargar las compras. ');
      },
    });
  }

  // Cargar todos los productos de las ventas y guardarlo en cache
  loadAllProductForSales(sales: Sales[]): void {
    // Evita repetir requests para el mismo producto
    const productIds = new Set<string>();
    sales.forEach((sale) => {
      sale.products.forEach((item) => {
        if (item.product_id && !this.productCache[item.product_id]) {
          productIds.add(item.product_id);
        }
      });
    });

    // Para cada id de producto, pedir su detalle y guardar en cache
    productIds.forEach((id) => {
      this.ps.getProductByid(id).subscribe({
        next: (product: Product) => {
          this.productCache[id] = product;
        },
        error: (e: Error) => {
          console.log(e.message);
        },
      });
    });
  }

  getProductName(idProducto: string): string {
    return this.productCache[idProducto]?.name ?? '--';
  }

  eliminarVenta(id: string): void {
    this.ss.deleteSale(id).subscribe(
      () => {
        this.listSales = this.listSales.filter((venta) => venta.id !== id);
        alert('Venta eliminada con éxito.');
      },
      (error) => {
        console.log(error);
        alert('Error al eliminar la venta');
      }
    );
  }
}
