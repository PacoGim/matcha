// Coordinates and GPS validation rules
// This file is shared between frontend and backend

import { ValidationErrorType } from "../../../interfaces/ValidationError.type"

export function validateLatitude(latitude: unknown): ValidationErrorType | null {
    if (latitude === undefined || latitude === null) {
        return null
    }

    if (typeof latitude !== 'number' || Number.isNaN(latitude)) {
        return {
            field: 'latitude',
            message: 'Latitude must be a number',
            error: 'Latitude must be a number',
        }
    }

    if (latitude < -90 || latitude > 90) {
        return {
            field: 'latitude',
            message: 'Latitude must be between -90 and 90',
            error: 'Latitude must be between -90 and 90',
        }
    }

    return null
}

export function validateLongitude(longitude: unknown): ValidationErrorType | null {
    if (longitude === undefined || longitude === null) {
        return null
    }

    if (typeof longitude !== 'number' || Number.isNaN(longitude)) {
        return {
            field: 'longitude',
            message: 'Longitude must be a number',
            error: 'Longitude must be a number',
        }
    }

    if (longitude < -180 || longitude > 180) {
        return {
            field: 'longitude',
            message: 'Longitude must be between -180 and 180',
            error: 'Longitude must be between -180 and 180',
        }
    }

    return null
}

export function validateAllowGps(allowGps: unknown): ValidationErrorType | null {
    if (allowGps === undefined || allowGps === null) {
        return null
    }

    if (typeof allowGps !== 'boolean') {
        return {
            field: 'allow_gps',
            message: 'allow_gps must be a boolean',
            error: 'allow_gps must be a boolean',
        }
    }

    return null
}

export function getValidationRulesDescription(): string {
    return 'Latitude must be between -90 and 90, longitude between -180 and 180, and allow_gps must be a boolean.'
}
