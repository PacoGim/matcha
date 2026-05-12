export default function unauthorized(res: any, message: string = "Unauthorized") {
    return res.clearCookie('token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
    }).status(401).json({ error: message });
}   