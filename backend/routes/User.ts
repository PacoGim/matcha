import {Router} from "express"
import db from "../database/db"
import {hash, compare} from "bcrypt"
const userRoute = Router()

userRoute.get("/users", async (req, res) => {
    try {
        console.log("userRoute", req)
        const result = await db.getPool().query("SELECT * FROM users;")
        res.json(result.rows)
    } catch (err) {
        console.error(err)
        res.status(500).json({ error: "DB error" })
    }
})

userRoute.post("/user/register", async (req, res) => {
    try {
        const { email, username, password, first_name, last_name } = req.body
        const hashedPassword = await hash(password, 10)
        console.log("userRegister", req.body, hashedPassword)
        const result = await db.getPool().query("INSERT INTO users (email, username, password_hash, first_name, last_name) VALUES ($1, $2, $3, $4, $5) RETURNING id;", [email, username, hashedPassword, first_name, last_name])
        res.json({ userId: result.rows[0].id })
    } catch (err) {
        console.error(err)
        res.status(500).json({ error: "DB error" })
    }
})

userRoute.post("/user/login", async (req, res) => {
    try {
        const { email, password } = req.body

        const result = await db.getPool().query("SELECT password_hash FROM users WHERE email=$1;", [email])

        if (!result.rows.length) {
            return res.status(401).json({ error: "Invalid credentials" })
        }

        const isMatch = await compare(password, result.rows[0].password_hash)

        if (!isMatch) {
            return res.status(401).json({ error: "Invalid credentials" })
        }

        res.json({ message: "Login successful" })
    } catch (err) {
        console.error(err)
        res.status(500).json({ error: "DB error" })
    }
})

export default userRoute