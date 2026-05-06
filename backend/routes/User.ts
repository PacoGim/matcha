import {Router} from "express"
import db from "../database/db"


const userRoute = Router()

userRoute.get("/users", async (req, res) => {
    try {
        const result = await db.getPool().query("SELECT * FROM users;")
        res.json(result.rows)
    } catch (err) {
        console.error(err)
        res.status(500).json({ error: "DB error" })
    }
})

userRoute.get("/profiles", async (req, res) => {
    try {
        const result = await db.getPool().query("SELECT * FROM profiles;")
        res.json(result.rows)
    } catch (err) {
        console.error(err)
        res.status(500).json({ error: "DB error" })
    }
})

export default userRoute