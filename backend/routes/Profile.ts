import {Router} from "express"
import db from "../database/db"


const profileRoute = Router()

profileRoute.get("/profile/:id", async (req, res) => {
    try {
        const userId = req.params.id
        const result = await db.getPool().query("SELECT * FROM profiles WHERE user_id=$1;", [userId])
        res.json(result.rows)
    } catch (err) {
        console.error(err)
        res.status(500).json({ error: "DB error" })
    }
})

export default profileRoute

// 8fbde9c9-1e9a-486e-8ca6-6cfb3bef0f78