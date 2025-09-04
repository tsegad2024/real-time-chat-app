import express from "express";
import dotenv, { config } from 'dotenv';
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser'

import authRoute from "./routes/auth.route.js"
import { connectDB } from "./lib/db.js";



const app = express();

dotenv.config();

app.use(express.json())
app.use("/api/auth", authRoute)
app.use(cookieParser())

const PORT = process.env.PORT;
app.listen(PORT, ()=>{
    console.log("Server is running on port "+ PORT)
    connectDB()
})