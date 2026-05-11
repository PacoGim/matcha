// Sexual preference validation rules
// This file is shared between frontend and backend

export interface ValidationError {
  field: string;
  message?: string;
  error?: string;
}

export const SEXUAL_PREFERENCE_VALUES = ['male', 'female', 'both'] as const

export function validateSexualPreference(value: unknown): ValidationError | null {
  if (value === undefined || value === null) {
    return null
  }

  if (typeof value !== 'string') {
    return {
      field: 'sexual_preference',
      message: 'Sexual preference must be a string',
      error: 'Sexual preference must be a string',
    }
  }

  if (!SEXUAL_PREFERENCE_VALUES.includes(value as any)) {
    return {
      field: 'sexual_preference',
      message: `Sexual preference must be one of: ${SEXUAL_PREFERENCE_VALUES.join(', ')}`,
      error: `Sexual preference must be one of: ${SEXUAL_PREFERENCE_VALUES.join(', ')}`,
    }
  }

  return null
}

export function getValidationRulesDescription(): string {
  return `Sexual preference must be one of: ${SEXUAL_PREFERENCE_VALUES.join(', ')}`
}
