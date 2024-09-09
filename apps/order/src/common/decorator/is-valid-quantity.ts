import { registerDecorator, ValidationOptions, ValidationArguments } from 'class-validator';

export function IsValidQuantity(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isValidQuantity',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          if (typeof value !== 'number') {
            return false;
          }
          const stringValue = value.toFixed(2);
          const numValue = parseFloat(stringValue);
          return numValue === value && numValue >= 0.01;
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} must be a positive number with up to 2 decimal places and minimum value of 0.01`;
        },
      },
    });
  };
}
