import express, { Request,Response, Router } from 'express';
import { RedisManager } from '../utils/RedisManager';
import {CREATE_ORDER,DELETE_ORDER} from '../types/types'
export const UserRoutes = Router();

UserRoutes.post("/send",async(req:Request,res:Response)=>{

    const {market,price,quantity,side,userId}=req.body
    // ORDER PR ZOD
    
    console.log("order",market,price,quantity,side,userId)
    
    const redisClient=await RedisManager.getInstace().sendMessage({
        type:CREATE_ORDER,
        payload:{
            market:market,
            price:price,
            quantity:quantity,
            side:side,
            userId:userId
        }
    })
    
    res.json({
        "status":200,
        "message":"Order Placed"
    })

})
