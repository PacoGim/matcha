// Birthdate validation rules
// This file is shared between frontend and backend

import type { ValidationErrorType } from "../../../interfaces/ValidationError.type"

export function validateBirthdate(birthdate: unknown): ValidationErrorType | null {
    if (birthdate === undefined || birthdate === null) {
        return {
            field: 'birthdate',
            message: 'Birthdate is required',
            error: 'Birthdate is required',
        }
    }

    if (typeof birthdate !== 'string') {
        return {
            field: 'birthdate',
            message: 'Birthdate must be a string in YYYY-MM-DD format',
            error: 'Birthdate must be a string in YYYY-MM-DD format',
        }
    }

    const birthdateRegex = /^\d{4}-\d{2}-\d{2}$/
    if (!birthdateRegex.test(birthdate)) {
        return {
            field: 'birthdate',
            message: 'Birthdate must be in YYYY-MM-DD format',
            error: 'Birthdate must be in YYYY-MM-DD format',
        }
    }

    const birthDateObj = new Date(birthdate)
    const today = new Date()
    const age = today.getFullYear() - birthDateObj.getFullYear()
    const monthDiff = today.getMonth() - birthDateObj.getMonth()
    const dayDiff = today.getDate() - birthDateObj.getDate()

    if (age < 18 || (age === 18 && (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)))) {
        return {
            field: 'birthdate',
            message: 'You must be at least 18 years old to register',
            error: 'You must be at least 18 years old to register',
        }
    }

    return null
}

export function getValidationRulesDescription(): string {
    return 'Birthdate must be a valid date in YYYY-MM-DD format, and you must be at least 18 years old to register.'
}
