import { createClient,RedisClientType } from 'redis';
import {Message_Type} from '../types/messageType'

export class RedisManager  {
    private static instance:RedisManager
    private publisher:RedisClientType
    

    constructor(){
        this.publisher=createClient({
            url:"redis://localhost:6379"

        })
        this.publisher.connect().then(() => {
        console.log(" Redis publisher connected");
    }).catch(console.error);

    }

    public static getInstance(){
        if(!this.instance){
            this.instance= new RedisManager();
        }
        return this.instance;
    }

    private getRandomId() {
        return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    }
    
    public sendMessage(message:Message_Type){
        return new Promise((resolve)=>{
            const id=this.getRandomId()
            this.publisher.subscribe(id,(message)=>{
                this.publisher.unsubscribe(id)
                resolve(JSON.parse(message))
            })
        })
    }
    public publishToApi(clientId:string,message:any){
        try {
            console.log("Publishing to API:", clientId, message);
            this.publisher.publish(clientId,JSON.stringify(message))
        } catch (error) {
            console.error("Error publishing to API:", error);
        }
    }
// queue se pop krna h isne aur phir orderfulfull krna h -- done
// isne user ko wapis dena h ki kitna kitna hogya h sort // ab yeh engine h isne pubsub mei orderfullfill hone ka dalna h
// isne trade ke updates orderbook pr dalne h
}
