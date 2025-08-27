import { createClient,RedisClientType } from 'redis';
import {Message_Type} from '../types/messageType'
export class RedisManager  {
    private static instance:RedisManager
    private client:RedisClientType
    private publisher:RedisClientType

    constructor(){
        this.client=createClient({
            url:"redis://localhost:6379"

        })
        this.client.connect().then(() => {
        console.log("Redis client connected");
    }).catch(console.error);

        this.publisher=createClient({
            url:"redis://localhost:6379"
        })
        this.publisher.connect().then(() => {
        console.log("Redis client connected");
    }).catch(console.error);

    }

    public static getInstace(){
        if(!this.instance){
            this.instance= new RedisManager();
        }
        return this.instance;
    }

    private getRandomId() {
        return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    }
    // add check for message here
    public sendMessage(message:any){
        try {
            return new Promise((resolve)=>{
            const id=this.getRandomId()
            this.client.subscribe(id,(message)=>{
                this.client.unsubscribe(id)
                resolve(JSON.parse(message))
            })
            this.publisher.lPush("message",JSON.stringify({clientId:id,message }))
             })
        } catch (error) {
            console.error("Error sending message:", error);
            return Promise.reject(error);   
            
        }
    }
}

// how to add polling here