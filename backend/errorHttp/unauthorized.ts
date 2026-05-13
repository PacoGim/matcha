import { Response } from "express"

export default function unauthorized(res: Response, message: string = "Unauthorized") {
    console.warn("⚠️⚠️⚠️⚠️ Attack detected! ⚠️⚠️⚠️⚠️")
    console.warn(message)
    return res.clearCookie('token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
    }).status(401).json({ error: "Unauthorized" })
}   