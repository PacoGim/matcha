// Password validation rules
// This file is shared between frontend and backend

import { type ValidationErrorType } from "../../../interfaces/ValidationError.type"

// Common dictionary words to avoid (case insensitive)
const COMMON_DICTIONARY_WORDS = [
    'password', '123456', '123456789', 'qwerty', 'abc123', 'password123',
    'admin', 'letmein', 'welcome', 'monkey', '1234567890', 'iloveyou',
    'princess', 'rockyou', '1234567', '12345678', 'password1', '123123',
    'football', 'baseball', 'welcome1', 'admin123', 'qwerty123', '1q2w3e4r',
    'sunshine', 'superman', 'michael', 'jennifer', 'jordan', 'jessica',
    'pepper', 'zaq1zaq1', 'flower', 'tigger', 'summer', 'dragon', 'trustno1',
    'ninja', 'computer', 'shadow', 'internet', 'whatever', 'nothing',
    'batman', 'pokemon', 'pokemon1', 'killer', 'pepper1', 'zaqwsx',
    'qwertyuiop', 'asdfghjkl', 'zxcvbnm', 'qazwsx', 'password12',
    'letmein1', 'welcome123', 'monkey123', 'football1', 'baseball1',
    'superman1', 'michael1', 'jennifer1', 'jordan1', 'jessica1',
    'pepper2', 'flower1', 'tigger1', 'summer1', 'dragon1', 'trustno2',
    'ninja1', 'computer1', 'shadow1', 'internet1', 'whatever1', 'nothing1',
    'batman1', 'pokemon2', 'killer1', 'pepper3', 'zaqwsx1', 'qwertyuiop1',
    'asdfghjkl1', 'zxcvbnm1', 'qazwsx1', 'password123', 'letmein123',
    'welcome1234', 'monkey1234', 'football123', 'baseball123', 'superman123',
    'michael123', 'jennifer123', 'jordan123', 'jessica123', 'pepper123',
    'flower123', 'tigger123', 'summer123', 'dragon123', 'trustno123',
    'ninja123', 'computer123', 'shadow123', 'internet123', 'whatever123',
    'nothing123', 'batman123', 'pokemon123', 'killer123', 'pepper1234',
    'zaqwsx123', 'qwertyuiop123', 'asdfghjkl123', 'zxcvbnm123', 'qazwsx123'
]

export const PASSWORD_RULES = {
    MIN_LENGTH: 8,
    REQUIRE_UPPERCASE: true,
    REQUIRE_LOWERCASE: true,
    REQUIRE_DIGIT: true,
    REQUIRE_SPECIAL: true,
    FORBIDDEN_WORDS: COMMON_DICTIONARY_WORDS,
}

export function validatePassword(password: string): ValidationErrorType | null {
    if (!password || password.trim() === '') {
        return {
            field: 'password',
            message: 'Password is required',
        }
    }

    if (password.length < PASSWORD_RULES.MIN_LENGTH) {
        return {
            field: 'password',
            message: `Password must be at least ${PASSWORD_RULES.MIN_LENGTH} characters long`,
        }
    }

    if (PASSWORD_RULES.REQUIRE_UPPERCASE && !/[A-Z]/.test(password)) {
        return {
            field: 'password',
            message: 'Password must contain at least one uppercase letter',
        }
    }

    if (PASSWORD_RULES.REQUIRE_LOWERCASE && !/[a-z]/.test(password)) {
        return {
            field: 'password',
            message: 'Password must contain at least one lowercase letter',
        }
    }

    if (PASSWORD_RULES.REQUIRE_DIGIT && !/\d/.test(password)) {
        return {
            field: 'password',
            message: 'Password must contain at least one digit',
        }
    }

    if (PASSWORD_RULES.REQUIRE_SPECIAL && !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
        return {
            field: 'password',
            message: 'Password must contain at least one special character',
        }
    }

    // Check for common dictionary words
    const lowerPassword = password.toLowerCase()
    for (const word of PASSWORD_RULES.FORBIDDEN_WORDS) {
        if (lowerPassword.includes(word)) {
            return {
                field: 'password',
                message: 'Password contains common dictionary words and is not secure enough',
            }
        }
    }

    return null
}

export function getValidationRulesDescription(): string {
    return `Password must be at least ${PASSWORD_RULES.MIN_LENGTH} characters with uppercase, lowercase, digit, and special character. Common dictionary words are not allowed.`
}