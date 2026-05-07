import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"

import db from "./database/db"
import userRoute from "./routes/User"
import profileRoute from "./routes/Profile"

import dotenv from "dotenv"
import path from "path"
const __dirname = path.resolve()
dotenv.config({
    path: path.resolve(__dirname, "../.env")
})
const app = express()
db.initPool()
const PORT = 3000


app.use(express.json())
app.use(cookieParser())

app.use(cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization']
}))

app.use("/", userRoute)
app.use("/", profileRoute)

app.use(express.static(path.join(__dirname, "../frontend/build")))

app.listen(PORT, () => {
    console.log(`server started ${PORT}`)
})
