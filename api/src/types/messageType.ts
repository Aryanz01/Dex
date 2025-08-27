import {CREATE_ORDER} from './types'
export type Message_Type={
    type:typeof CREATE_ORDER,
    payload:{
        market: string,
        price: string,
        quantity: string,
        side: "buy" | "sell",
        userId: string
    }
}