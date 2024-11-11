import { CartItem } from "./cart-item";

export interface Cart {
    id: string,
    idUser: string,  
    totalAmount: number,
    products: CartItem[]
}
