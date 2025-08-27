import { CREATE_ORDER } from "../types/types";
import {RedisManager} from './RedisManager'
import {OrderType,Fill,ORDER} from '../types/types'

export class EnginerManager{
    private ask:ORDER[]
    private bids:ORDER[]
    baseAsset: string;
    quoteAsset: string  
    lastTradeId:number

    constructor(){
        this.lastTradeId=0;
        this.ask=[]
        this.bids=[]
        this.baseAsset=""
        this.quoteAsset=""
    }
    public logger(){
        return (this.ask)
    }
    public logger2(){
        return (this.bids)
    }
    public process({clientId,message}:{clientId:string,message:any}){
        switch(message.type){
            case CREATE_ORDER:
                try {
                const {executedQty,fills}=this.addOrder(message.payload.market,message.payload.price,message.payload.quantity,message.payload.side,message.payload.userId)
                const data=JSON.stringify({executedQty,fills});
                RedisManager.getInstance().publishToApi(clientId,data)
                } catch (error) {
                    RedisManager.getInstance().publishToApi(clientId,"couldnt resolve the order")
                }
        
            case "DELETE_ORDER":

            case "OPEN_ORDER":
        }   
        
    }
    public addOrder(market:string,price:number,quantity:number,side:string,userId:string):{ fills: Fill[], executedQty: number }{
        const executedQty=-1;
        let fills:Fill[]=[];
        if(side=="buy"){
            const {executedQty,fills}=this.matchAsks(market,price,quantity,userId);
            return {executedQty,fills}
        }else if(side=="sell"){
            const {executedQty,fills}=this.matchBids(market,price,quantity,userId);
            return {executedQty,fills}
        }
        return {executedQty,fills} //fallback ki -1 ajaye
    }
    // check for market
    // balance fetch and lock logic
    private matchAsks(market:string,price:number,quantity:number,userId:string):{ fills: Fill[], executedQty: number }{  
        let executedQty=0;
        let fills:Fill[]=[]
            this.ask.sort();
            for(let i=0;i<this.ask.length;i++){
                if(executedQty===(quantity)){
                    return{
                        fills,
                        executedQty
                    }
                }
                if(this.ask[i].price<=price){
                    const quantityMatched=Math.min(quantity-executedQty,this.ask[i].quantity)
                    executedQty+=quantityMatched
                    this.ask[i].filled+=quantityMatched
                    this.ask[i].quantity-=quantityMatched
                    if(this.ask[i].quantity===0){
                        this.ask.splice(i,1)
                    }
                    let a=fills.push({
                        price:this.ask[i].price,
                        qty:quantityMatched,
                        tradeId:this.lastTradeId++,
                        anotherUserId:this.ask[i].userId,
                        marketId:Math.random().toString().substring(2,10)+Math.random().toString().substring(2,10)     
                    })
                }else{
                    this.bids.push({
                        price:price,
                        quantity:quantity-executedQty,
                        market:market,
                        userId:userId,
                        filled:executedQty
                    })
                }              
            }
            for(let i=0;i<this.ask.length;i++){
                if(this.ask[i].filled===this.ask[i].quantity){
                    this.ask.splice(i,1)
                }
            }
            if(this.ask.length==0){
                this.bids.push({
                    price:price,
                    quantity:quantity,
                    market:market,
                    userId:userId,
                    filled:0
                })
            } 
        return { fills, executedQty };
    }
    private matchBids(market:string,price:number,quantity:number,userId:string){
        let fills:Fill[]=[]
        let executedQty=0;

        this.bids.sort((a:any, b:any) => b - a);
        for(let i=0;i<this.bids.length;i++){
            if(executedQty===quantity){
                return{
                    executedQty,
                    fills
                }
            }
            if(this.bids[i].price>=price && executedQty<quantity){
                let quantityToSort=Math.min(this.bids[i].quantity,quantity-executedQty)
                executedQty+=quantityToSort
                this.bids[i].filled+=quantityToSort
                this.bids[i].quantity-=quantityToSort
                    if(this.bids[i].quantity===0){
                        this.bids.splice(i,1)
                    }
                fills.push({
                price:this.bids[i].price,
                qty:quantityToSort,
                tradeId:this.lastTradeId++,
                anotherUserId:this.bids[i].userId,
                marketId:Math.random().toString().substring(2,10)+Math.random().toString().substring(2,10)     
                })
            }else{
                this.bids.push({
                    price:price,
                    quantity:quantity,
                    market:market,
                    userId:userId,
                    filled:executedQty
                })
            }
        }
        for(let i=0;i<this.bids.length;i++){
                if(this.bids[i].filled===this.bids[i].quantity){
                    this.bids.splice(i,1)
                }
        }
        if(this.bids.length==0){
            this.ask.push({
                price:price,
                quantity:quantity,
                market:market,
                userId:userId,
                filled:0
            })
        } 
    return { fills, executedQty };
    }
}
