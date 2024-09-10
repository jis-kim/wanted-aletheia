import { registerDecorator, ValidationOptions, ValidationArguments } from 'class-validator';

function isValidQuantity(value: unknown): boolean {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return false;
  }
  const stringValue = value.toFixed(2);
  const numValue = parseFloat(stringValue);
  return numValue === value && numValue >= 0.01;
}

export function IsValidQuantity(validationOptions?: ValidationOptions): PropertyDecorator {
  return function (target: object, propertyName: string): void {
    registerDecorator({
      name: 'isValidQuantity',
      target: target.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: unknown): boolean {
          return isValidQuantity(value);
        },
        defaultMessage(args: ValidationArguments): string {
          return `${args.property} must be a positive number with up to 2 decimal places and minimum value of 0.01`;
        },
      },
    });
  };
}
