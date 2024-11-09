import { Cart } from "../../cart/interface/cart";

export interface Sales {
    date: string,
    cart: Cart,
    //Agregar lo necesario sobre metodo de pago etc o id de pago
}
