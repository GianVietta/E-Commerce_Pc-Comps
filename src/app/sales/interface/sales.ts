import { CartItem } from "../../cart/interface/cart-item";

export interface Sales {
    id: string;//Id de la venta unica
    idUser: string;//Id del usuario que realizao la compra
    date: string;//Fecha de la venta de la pagina
    totalAmount: number;//Precio total de la operacion
    products: CartItem[];//Productos incluidos
    //Agregar lo necesario sobre un comprobante
}
