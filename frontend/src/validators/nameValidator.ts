// Name validation rules (first_name, last_name)
// This file is shared between frontend and backend

export interface ValidationError {
  field: string;
  message: string;
}

export const NAME_RULES = {
  MAX_LENGTH: 20,
  PATTERN: /^[a-zA-Z]([a-zA-Z\s\-]*[a-zA-Z])?$/, // Starts and ends with letter, contains only letters, spaces, and hyphens
};

export function validateName(name: string, fieldName: string = 'name'): ValidationError | null {
  if (!name || name.trim() === '') {
    return {
      field: fieldName,
      message: `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} is required`,
    };
  }

  if (name.length > NAME_RULES.MAX_LENGTH) {
    return {
      field: fieldName,
      message: `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} must not exceed ${NAME_RULES.MAX_LENGTH} characters`,
    };
  }

  if (!NAME_RULES.PATTERN.test(name)) {
    return {
      field: fieldName,
      message: `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} must contain only letters, spaces, and hyphens`,
    };
  }

  return null;
}

export function getValidationRulesDescription(): string {
  return `Must be 1-${NAME_RULES.MAX_LENGTH} characters, containing only letters, spaces, and hyphens.`;
}
