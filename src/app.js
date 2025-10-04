import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser" 
const app=express();
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
}));
app.use(express.json({limit:"16kb"}));
app.use(express.urlencoded({extended:true,limit:"16kb"}));//different  url between urlencoded and json
app.use(express.static("public"));//static files and public is my folder name
app.use(cookieParser()); // it is use for access cookie in req object
export {app}


