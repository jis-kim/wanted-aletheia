import { registerDecorator, ValidationOptions } from 'class-validator';

export function IsDecimalWithOneOrTwoDP(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isDecimalWithOneOrTwoDP',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any) {
          if (typeof value !== 'number') return false;
          const stringValue = value.toString();
          // 정수 또는 소수점 첫째자리나 둘째자리까지의 숫자 허용
          return /^-?\d+(\.\d{1,2})?$/.test(stringValue);
        },
        defaultMessage() {
          return `${propertyName} must be a number with up to 2 decimal places`;
        },
      },
    });
  };
}
