import express, { Request, Response } from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
import fs from "fs"
import http from "http"
import https from "https"

import db from "./database/db"
import userRoute from "./routes/User"
import profileRoute from "./routes/Profile"

import dotenv from "dotenv"
import path from "path"
import { authenticateToken } from "./middleware/auth"
import loginRoute from "./routes/Authentication/Login"
import registerRoute from "./routes/Authentication/Register"
const __dirname = path.resolve()
dotenv.config({
    path: path.resolve(__dirname, "../.env")
})

const options = {
    key: fs.readFileSync(path.join(__dirname, "ssl/key.pem")),
    cert: fs.readFileSync(path.join(__dirname, "ssl/cert.pem")),
    agent: new https.Agent({
        rejectUnauthorized: false
    })
}

const app = express()
db.initPool()
const HTTP_PORT = process.env.HTTP_PORT || 3000
const HTTPS_PORT = process.env.HTTPS_PORT || 8443

app.use(express.json())
app.use(cookieParser())

app.use(cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization']
}))

app.use("/", userRoute, loginRoute, registerRoute)
app.use("/", profileRoute)

app.get('/images/:id/:idx', authenticateToken, (req, res) => {
    const { id, idx } = req.params
    // const imagePath = path.join(__dirname, `./images/${id}/${idx}.png`)
    const imagePath = path.join(__dirname, `./images/${id}.jpg`)
    if (fs.existsSync(imagePath)) {
        res.sendFile(imagePath)
    } else {
        res.status(404).send("Image not found")
    }
})

app.use(express.static(path.join(__dirname, "../frontend/build")))

app.use((req: Request, res: Response) => {
    res.sendFile(path.join(__dirname, '../frontend/build', 'index.html'))
})


http.createServer(app).listen(HTTP_PORT, () => {
    console.log(`HTTP server started on port ${HTTP_PORT}`)
})

https.createServer(options, app).listen(HTTPS_PORT, () => {
    console.log(`HTTPS server started on port ${HTTPS_PORT}`)
})


