import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
    user?: {
        id: string;
        email: string;
        username: string;
    };
}

export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction) => {
    const token = req.cookies?.token;

    if (!token) {
        return res.status(401).json({ error: 'Access token required' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        req.user = decoded as { id: string; email: string; username: string };
        next();
    } catch (err) {
        return res.status(403).json({ error: 'Invalid or expired token' });
    }
};