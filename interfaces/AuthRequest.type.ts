import { type Request } from 'express';
import type { BaseUserType } from './User.type';

export interface AuthRequestType extends Request {
    user?: BaseUserType
}