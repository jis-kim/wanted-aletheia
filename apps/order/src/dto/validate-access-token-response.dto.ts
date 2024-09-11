import { TokenPayload } from 'apps/auth/src/type/token-payload.type';

export class ValidateAccessTokenResponseDto {
  isValid: boolean;
  payload: TokenPayload;
}
