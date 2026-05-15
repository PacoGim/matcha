// Username validation rules
// This file is shared between frontend and backend

import type { ValidationErrorType } from "../interfaces/ValidationError.type"

export const USERNAME_RULES = {
    MIN_LENGTH: 3,
    MAX_LENGTH: 20,
    PATTERN: /^[a-zA-Z][a-zA-Z0-9_]*$/, // Starts with letter, contains letters, numbers, underscores
};

export function validateUsername(username: string): ValidationErrorType | null {
    if (!username || username.trim() === '') {
        return {
            field: 'username',
            message: 'Username is required',
        };
    }

    if (username.length < USERNAME_RULES.MIN_LENGTH) {
        return {
            field: 'username',
            message: `Username must be at least ${USERNAME_RULES.MIN_LENGTH} characters long`,
        };
    }

    if (username.length > USERNAME_RULES.MAX_LENGTH) {
        return {
            field: 'username',
            message: `Username must not exceed ${USERNAME_RULES.MAX_LENGTH} characters`,
        };
    }

    if (!USERNAME_RULES.PATTERN.test(username)) {
        return {
            field: 'username',
            message: 'Username must start with a letter and contain only letters, numbers, and underscores',
        };
    }

    return null;
}

export function getValidationRulesDescription(): string {
    return `Username must be ${USERNAME_RULES.MIN_LENGTH}-${USERNAME_RULES.MAX_LENGTH} characters, start with a letter, and contain only letters, numbers, and underscores.`;
}
