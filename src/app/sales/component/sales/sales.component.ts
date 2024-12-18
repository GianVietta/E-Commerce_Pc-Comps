import { Router } from '@angular/router';
import { Component, inject, OnInit, ViewEncapsulation } from '@angular/core';
import { Sales } from '../../interface/sales';
import { AuthService } from '../../../auth/service/auth.service';
import { SalesService } from '../../service/sales.service';
import { CommonModule } from '@angular/common';
import { Product } from '../../../product/interface/product';
import { User } from '../../../auth/interface/auth';

@Component({
  selector: 'app-sales',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sales.component.html',
  styleUrl: './sales.component.css',
  encapsulation: ViewEncapsulation.Emulated
})
export class SalesComponent implements OnInit {
  ss = inject(SalesService);
  authService = inject(AuthService);
  listSales: Sales[] = [];
  listProducts: {product: Product; quantity: number}[]=[];
  userId:string | undefined;
  router= inject(Router);

  ngOnInit(): void {
    this.authService.checkStatusAutentication().subscribe(
      auth => {
        if (this.getUser==undefined) {
          console.log('Usuario no autenticado');
          // Redireccionar a la página de login o mostrar un mensaje de error
          this.router.navigate(['/']);
          return;
        }else {
          this.userId=this.getUser?.id;
          console.log(this.userId);
      }
      this.loadSalesByUser();
    }
    );
  }

  get getUser(): User | undefined {
    return this.authService.currentUser;
  }

  loadSalesByUser(): void {
    this.listProducts=[];
    if (this.userId == '1') {
      console.log("entra");
      this.loadAllSales();
    }  
    else if (this.userId) {
      this.loadSalesByUserID();
    }
  }
  loadAllSales(){
    this.ss.getSales().subscribe({
      next: (sales: Sales[])=>{
        this.listSales= sales;
        if(sales && sales.length>0){
          this.processSalesProducts(sales);
        }else{
          console.warn('No hay ventas disponibles. ');
        }
      },
      error: (e:Error)=>{
        console.log(e.message);
        alert('Error al cargar las ventas. ');
      }
    });
  }
  loadSalesByUserID(){
    this.ss.getSalesByUserId(this.userId!).subscribe({
      next: (sales: Sales[])=>{
        this.listSales= sales;
        if(sales && sales.length>0){
          this.processSalesProducts(sales);
        }else{
          console.warn('No hay compras para este usuario. ');
        }
      },
      error: (e:Error)=>{
        console.log(e.message);
        alert('Error al cargar las compras. ');
      }
    });
  }
  processSalesProducts(sales: Sales[]){
    sales.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    sales.forEach(sale=>{
      sale.products.forEach(saleProduct=>{
        this.ss.getProductDetails(saleProduct.idProduct).subscribe({
          next: (product: Product)=>{
            this.listProducts.push({product, quantity: saleProduct.quantity});
          },
          error: (e:Error)=>{
            console.log(e.message);
          }
        });
      });
    });
  }
  getProductName(idProducto: string): string{
    const founProduct= this.listProducts.find(item=>item.product.id===idProducto);
    return founProduct? founProduct.product.name: 'Producto no disponible';
  }
  eliminarVenta(id: string): void {
    this.ss.deleteSale(id).subscribe(() => {
      this.listSales = this.listSales.filter(venta => venta.id !== id);
      alert('Venta eliminada con éxito.');
    }, (error) => {
      console.log(error);
      alert('Error al eliminar la venta');
    });
  }
}
