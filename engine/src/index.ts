import { createClient } from "redis";
import { EnginerManager } from "./utils/EngineManager";

const Engine=new EnginerManager();

const redisClient = createClient({
    url:"redis://localhost:6379"
});


async function process(){
await redisClient.connect().then((resolve)=>{
    console.log("client connected")
});
    while(true){
        const event=await redisClient.rPop("message" as string)
        if(!event){

        }else{
            // console.log(JSON.parse(event))
            Engine.process(JSON.parse(event));
            console.log("asks",Engine.logger())
            console.log("bids",Engine.logger2())
        }
    }
}

process()