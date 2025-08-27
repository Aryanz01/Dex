export const CREATE_ORDER="CREATE_ORDER"
export const DELETE_ORDER="DELETE_ORDER"

export interface OrderType {
   price: number;
    quantity: number;
    orderId: string;
    filled: number;
    side: "buy" | "sell";
    userId: string;
    type:string,
    market:string
}
export interface Fill{
    price:number
    qty:number
    tradeId:number
    anotherUserId:string
    marketId:string
}
export interface ORDER {
    price: number;
    quantity: number;
    userId: string;
    market:string;
    filled:number
}