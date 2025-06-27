import { Router, RouterLink } from '@angular/router';
import { Component, inject, OnInit, ViewEncapsulation } from '@angular/core';
import { Sales } from '../../interface/sales';
import { SalesService } from '../../service/sales.service';
import { CommonModule } from '@angular/common';
import { Product } from '../../../product/interface/product';
import { ProductService } from '../../../product/service/product.service';

import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-sales',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatInputModule,
    MatPaginatorModule,
    MatButtonModule,
    MatIconModule,
    FormsModule,
    MatSelectModule,
    RouterLink,
  ],
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

  // Manejo de paginacion
  page = 1;
  limit = 6;
  totalPages = 1;
  paginas: number[] = [];
  totalSales = 0;

  // Filtros
  searchGlobal = '';
  orderSelected: 'recent' | 'oldest' | 'cantidad_desc' | 'cantidad_asc' =
    'recent';

  ngOnInit(): void {
    const user = window.Clerk?.user;
    if (!user) {
      //Usuario no autenticado, mando al home
      this.router.navigate(['/']);
      return;
    }
    this.userId = user.id;
    this.isAdmin = user.publicMetadata?.['isAdmin'] === true;

    this.aplicarFiltros();
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

  // Metodo unico que carga ventas y total, para admin o user
  loadSalesAndCount(order_by: string, order: 'asc' | 'desc'): void {
    // Parámetros de filtros
    const params: any = {
      page: this.page,
      limit: this.limit,
      order_by,
      order,
      search: this.searchGlobal.replace(/\//g, '-').trim(),
      clerk_user_id: !this.isAdmin ? this.userId : undefined,
    };

    // 1) Cargar las ventas paginadas
    this.ss.getSalesPaginated(params).subscribe({
      next: (sales) => {
        this.listSales = sales;
        if (sales.length > 0) this.loadAllProductForSales(sales);
        else this.productCache = {};
      },
      error: (e) => alert('Error cargando ventas/compras'),
    });

    // 2) Cargar el total para paginación real
    this.ss.getSalesCount(params).subscribe({
      next: ({ total }) => {
        this.totalSales = total;
        this.totalPages = Math.ceil(this.totalSales / this.limit) || 1;
        this.paginas = Array.from({ length: this.totalPages }, (_, i) => i + 1);
      },
      error: (e) => alert('Error obteniendo total de ventas/compras'),
    });
  }
  // Cambiar de página
  cambiarPagina(p: number) {
    this.page = p;
    let order_by = 'created_at';
    let order: 'asc' | 'desc' = 'desc';
    switch (this.orderSelected) {
      case 'recent':
        order_by = 'created_at';
        order = 'desc';
        break;
      case 'oldest':
        order_by = 'created_at';
        order = 'asc';
        break;
      case 'cantidad_desc':
        order_by = 'cantidad';
        order = 'desc';
        break;
      case 'cantidad_asc':
        order_by = 'cantidad';
        order = 'asc';
        break;
    }
    this.loadSalesAndCount(order_by, order);
  }
  // Aplicar filtros (botón buscar, etc.)
  aplicarFiltros() {
    let order_by = 'created_at';
    let order: 'asc' | 'desc' = 'desc';
    switch (this.orderSelected) {
      case 'recent':
        order_by = 'created_at';
        order = 'desc';
        break;
      case 'oldest':
        order_by = 'created_at';
        order = 'asc';
        break;
      case 'cantidad_desc':
        order_by = 'cantidad';
        order = 'desc';
        break;
      case 'cantidad_asc':
        order_by = 'cantidad';
        order = 'asc';
        break;
    }
    this.page = 1;
    this.loadSalesAndCount(order_by, order);
  }
}
