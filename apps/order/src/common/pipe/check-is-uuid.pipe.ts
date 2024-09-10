import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { isUUID } from 'class-validator';

@Injectable()
export class CheckIsUUIDPipe implements PipeTransform<string, Promise<string>> {
  async transform(id: string): Promise<string> {
    if (isUUID(id) === false) {
      throw new BadRequestException('Invalid id format');
    }
    return id;
  }
}
