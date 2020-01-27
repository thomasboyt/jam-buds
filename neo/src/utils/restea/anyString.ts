import { ParameterValidator, ValidationError } from 'restea';

/**
 * Returns a validator that will succeed if any string is passed.
 */
export function anyString(): ParameterValidator<string, string> {
  return {
    get type() {
      return 'String';
    },
    validate(value) {
      if (typeof value !== 'string') {
        throw new ValidationError(
          `Expected ${this.type} but received: '${value}'`
        );
      }
      return value;
    },
    schema: {
      type: 'string',
    },
  };
}
