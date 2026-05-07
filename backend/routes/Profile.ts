import {Router} from "express"
import db from "../database/db"


const profileRoute = Router()

profileRoute.get("/profile/:id", async (req, res) => {
    try {
        const userId = req.params.id
        const result = await db.getPool().query("SELECT email,username,first_name,last_name,created_at FROM profiles WHERE user_id=$1;", [userId])
        res.json(result.rows)
    } catch (err) {
        console.error(err)
        res.status(500).json({ error: "DB error" })
    }
})

export default profileRoute
