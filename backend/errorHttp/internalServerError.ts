export default function internalServerError(res: any, err: any, message: string = "Internal Server Error") {
    console.error(message, err);
    return res.status(500).json({ error: message });
}