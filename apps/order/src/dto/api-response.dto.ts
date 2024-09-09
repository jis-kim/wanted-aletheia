import { HttpStatus } from '@nestjs/common';

/**
 * API 공통 response type
 */
export class ApiResponseDto<T> {
  /**
   * 성공 여부
   * - true: 성공
   * - false: 실패
   * @example true
   */
  success: boolean;

  /**
   * HTTP 상태 코드
   * @example 200
   */
  statusCode: number;

  /**
   * 메시지
   * @example '성공'
   */
  message: string;

  /**
   * 데이터 형식 (optional)
   * @example { id: 'uuid', name: '금' }
   */
  data?: T;

  // create method in controller
  static create<T>(data: T, statusCode: HttpStatus = HttpStatus.OK): ApiResponseDto<T> {
    const response = new ApiResponseDto<T>();
    response.success = true;
    response.statusCode = statusCode;
    response.message = '성공';
    response.data = data;
    return response;
  }
}
