import { Product } from "../../product/interface/product";

export interface Cart {
    idUser: string,  
    totalAmount: number,
    products: Product[]
}
