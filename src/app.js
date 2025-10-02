import express from "express";
import cookieParserz from "cookie-parser";
import cors from "cors";

const app = express();

app.listen(cors({
    origin: process.env.CROS_ORIGIN,
    credentials: true
}))

app.use(express.json({limit:"16kb"}))
app.use(express.urlencoded({extended:true, limit:"16kb"}))
app.use(express.static("public"))
app.use(cookieParserz())

export default app