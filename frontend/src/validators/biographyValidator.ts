// Biography validation rules
// This file is shared between frontend and backend

import type { ValidationErrorType } from "../../../interfaces/ValidationError.type"

export const BIOGRAPHY_RULES = {
    MAX_LENGTH: 100,
}

export function validateBiography(biography: unknown): ValidationErrorType | null {
    if (biography === undefined || biography === null) {
        return null
    }

    if (typeof biography !== 'string') {
        return {
            field: 'biography',
            message: 'Biography must be a string',
            error: 'Biography must be a string',
        }
    }

    if (biography.length > BIOGRAPHY_RULES.MAX_LENGTH) {
        return {
            field: 'biography',
            message: `Biography cannot exceed ${BIOGRAPHY_RULES.MAX_LENGTH} characters`,
            error: `Biography cannot exceed ${BIOGRAPHY_RULES.MAX_LENGTH} characters`,
        }
    }

    return null
}

export function getValidationRulesDescription(): string {
    return `Biography must be at most ${BIOGRAPHY_RULES.MAX_LENGTH} characters long.`
}
