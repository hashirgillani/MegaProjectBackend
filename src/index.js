import connect_db from "./db/index.js";
import dotenv from "dotenv";
import app from "./app.js";


dotenv.config({path:'./env'})
    
connect_db().then(()=>{
    app.listen(process.env.PORT|| 8000,()=>{
              console.log(`⚙️ Server is running at port : ${process.env.PORT}`);
            
    })

}).catch((err)=>{
    console.log("MongoDatabase connection failed",err);
    
})