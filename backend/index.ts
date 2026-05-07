import express from "express"
import cors from "cors"
import path from "path"
import "dotenv/config"

import db from "./database/db"
import userRoute from "./routes/User"
import profileRoute from "./routes/Profile"

const app = express()
db.initPool()
const PORT = 3000
const HOST = "10.171.62.221"

const __dirname = path.resolve()

app.use(express.json())

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
