import rateLimit from "express-rate-limit";



export const requestlimit = rateLimit({
    windowMs:15*60*1000,//15 minutes
    max:100,
    message:{error:"too many attemps, try again later"},
     standardHeaders: true,
})

export const strictLimit = rateLimit(
   { 
    windowMs:15*60*1000,//15 minutes
    max:5,
    message:{error:"too many attemps, try again later"},
    standardHeaders:true


   }
    
)