import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import unauthorized from '../errorHttp/unauthorized';
import forbidden from '../errorHttp/forbidden';

export interface AuthRequest extends Request {
    user?: {
        id: string;
        email: string;
        username: string;
    };
}

export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction) => {
    const token = req.cookies?.token;
    console.log('cookies:', req.cookies);

    if (!token) {
        return unauthorized(res, 'Access token required');
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        req.user = decoded as { id: string; email: string; username: string };
        next();
    } catch (err) {
        return forbidden(res, 'Invalid or expired token');
    }
};