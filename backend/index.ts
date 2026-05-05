import express from "express"
import cors from "cors"
import path from "path"


const app = express()
const PORT = 3000

const __dirname = path.resolve()

app.use(cors({
    origin: "http://localhost:3001"
}))

app.use(express.static(path.join(__dirname, "../frontend/build")))

// fetch database
import pg from "pg"
const { Pool } = pg

const pool = new Pool({
    host: "localhost",
    port: 5432,
    user: "matcha_user",
    password: "matcha_password",
    database: "matcha_db",
})

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
