import express from "express"
import cors from "cors"
import path from "path"

import db from "./Database/db"

const app = express()
db.initPool()
const PORT = 3000
const HOST = "10.171.62.221"
const pool = db.getPool()

const __dirname = path.resolve()

app.use(cors({
    origin: `http://${HOST}:3001`
}))

app.use(express.static(path.join(__dirname, "../frontend/build")))

app.get("/users", async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM users;")
        res.json(result.rows)
    } catch (err) {
        console.error(err)
        res.status(500).json({ error: "DB error" })
    }
})

app.get("/profiles", async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM profiles;")
        res.json(result.rows)
    } catch (err) {
        console.error(err)
        res.status(500).json({ error: "DB error" })
    }
})
// end fetch database

app.listen(PORT, () => {
    console.log(`server started ${PORT}`)
})
