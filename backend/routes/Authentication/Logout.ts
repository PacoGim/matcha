import { Router } from "express"
import internalServerError from "../../errorHttp/internalServerError"
import {api} from "../../../frontend/src/api/routes"

const logoutRouter = Router()
const logoutApi = api.auth.logout

logoutRouter[logoutApi.method](logoutApi.path, async (_req, res) => {
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

export default logoutRouter