import { type Response, type NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import unauthorized from '../errorHttp/unauthorized';
import forbidden from '../errorHttp/forbidden';
import type { AuthRequestType } from '../..//interfaces/AuthRequest.type';

export const authenticateToken = (req: AuthRequestType, res: Response, next: NextFunction) => {
    const token = req.cookies?.token;
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