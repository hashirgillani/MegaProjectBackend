import express from "express";
import cookieParserz from "cookie-parser";
import cors from "cors";


const app = express();

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))

app.use(express.json({limit:"16kb"}))
app.use(express.urlencoded({extended:true, limit:"16kb"}))
app.use(express.static("public"))
app.use(cookieParserz())


//import routers
import userRouter from "./routes/users.routers.js";

app.use("/api/v1/users",userRouter);


export default app

