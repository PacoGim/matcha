export default function forbidden(res: any, message: string = "Forbidden") {
    return res.clearCookie('token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
    }).status(403).json({ error: message });
}   