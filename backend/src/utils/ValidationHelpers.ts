import { ValidationError } from "@api-types/error.types";
import { ZodError } from "zod";

/**
 * Convert Zod errors to field-specific validation error format
 * Example output: { "password": ["Must contain a number"], "username": ["Must be at least 2 in length"] }
 *
 * @param error - The Zod validation error
 * @returns ValidationError object with field names as keys and error messages as arrays
 */
export function zodErrorToValidationError(error: ZodError): ValidationError {
  const validationErrors: ValidationError = {};

  error.issues.forEach((err) => {
    const field = err.path.join(".");
    if (!validationErrors[field]) {
      validationErrors[field] = [];
    }
    validationErrors[field].push(err.message);
  });

  return validationErrors;
}

/**
 * Alternative approach using Zod's built-in flatten method
 * This may be simpler for most use cases
 *
 * @param error - The Zod validation error
 * @returns ValidationError object
 */
export function zodFlattenToValidationError(error: ZodError): ValidationError {
  const flattened = error.flatten();
  return flattened.fieldErrors as ValidationError;
}
