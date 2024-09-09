/**
 * API 공통 response type
 */
export type ApiResponseDto<T> = {
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
};
