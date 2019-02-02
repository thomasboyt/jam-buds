interface Rule {
  isValid: (value: string) => boolean | Promise<boolean>;
  text: string;
}

interface Field {
  label: string;
  required?: boolean;
  rules?: Rule[];
}

export interface Fields {
  [fieldName: string]: Field;
}

interface ValidationError {
  fieldName: string;
  text: string;
}

export interface ValidationResults {
  data: {};
  errors: ValidationError[] | null;
}

// via https://github.com/Microsoft/TypeScript/issues/16069#issuecomment-369374214
function isNotNullOrUndefined<T extends Object>(
  input: null | undefined | T
): input is T {
  return input != null;
}

export async function validate(
  body: { [key: string]: any },
  fields: Fields
): Promise<ValidationResults> {
  const fieldNames = Object.keys(fields);
  const requiredFieldNames = fieldNames.map((name) => fields[name].required);

  const errorPromises = fieldNames.map(async (name) => {
    const field = fields[name];

    if (field.required && !body[name]) {
      return {
        fieldName: name,
        text: `${field.label} is required`,
      };
    }

    if (field.rules) {
      // TODO: Parallelize?
      // would need to be able to return multiple errors per field
      for (let rule of field.rules) {
        const isValid = await rule.isValid(body[name]);
        if (!isValid) {
          return {
            fieldName: name,
            text: rule.text,
          };
        }
      }
    }

    return null;
  });

  const errors = (await Promise.all(errorPromises)).filter(
    isNotNullOrUndefined
  );

  return {
    data: body,
    errors: errors.length > 0 ? errors : null,
  };
}
