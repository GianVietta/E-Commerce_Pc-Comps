import { SaleProduct } from './saleProduct';

export interface Sales {
  id: string; //Id de la venta unica
  clerk_user_id: string; //Id del usuario que realizao la compra
  total_amount: number; //Precio total de la operacion
  created_at: string; //Fecha de la venta de la pagina
  products: SaleProduct[]; //Productos incluidos
  //Agregar lo necesario sobre un comprobante
  //Campos para la vista
  user_name?: string;
  user_last_name?: string;
}
