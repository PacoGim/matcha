// Gender validation rules
// This file is shared between frontend and backend

import { ValidationErrorType } from "../../../interfaces/ValidationError.type"

export const GENDER_VALUES = ['male', 'female', 'other', 'null'] as const

export function validateGender(gender: unknown): ValidationErrorType | null {
    if (gender === undefined || gender === null) {
        return null
    }

    if (typeof gender !== 'string') {
        return {
            field: 'gender',
            message: 'Gender must be a string',
            error: 'Gender must be a string',
        }
    }

    if (!GENDER_VALUES.includes(gender as any)) {
        return {
            field: 'gender',
            message: `Gender must be one of: ${GENDER_VALUES.join(', ')}`,
            error: `Gender must be one of: ${GENDER_VALUES.join(', ')}`,
        }
    }

    return null
}

export function getValidationRulesDescription(): string {
    return `Gender must be one of: ${GENDER_VALUES.join(', ')}`
}
