import { Router } from "express"
import internalServerError from "../../errorHttp/internalServerError"

const logoutRoute = Router()

logoutRoute.post("/user/logout", async (req, res) => {
    try {
        res.clearCookie('token', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
        })
        res.json({ message: "Logout successful" })
    } catch (err) {
        return internalServerError(res, err, "Error logging out")
    }
})

export default logoutRoute