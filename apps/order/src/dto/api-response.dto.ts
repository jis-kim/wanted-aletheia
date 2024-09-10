import { HttpStatus } from '@nestjs/common';

export class PaginationLinks {
  /**
   * 첫 페이지 링크
   * @example "/api/orders?limit=10&offset=0"
   */
  first: string;

  /**
   * 마지막 페이지 링크
   * @example "/api/orders?limit=10&offset=50"
   */
  last: string;

  /**
   * 이전 페이지 링크
   * @example null
   */
  prev: string | null;

  /**
   * 다음 페이지 링크
   * @example "/api/orders?limit=10&offset=10"
   */
  next: string | null;
}

export class PaginationInfo {
  /**
   * 전체 주문 수
   * @example 55
   */
  total: number;

  /**
   * 페이지당 주문 수
   * @example 10
   */
  limit: number;

  /**
   * 시작 오프셋
   * @example 0
   */
  offset: number;

  /**
   * 현재 페이지 번호
   * @example 1
   */
  currentPage: number;

  /**
   * 전체 페이지 수
   * @example 6
   */
  totalPages: number;

  /**
   * 페이지네이션 링크
   */
  links: PaginationLinks;
}

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

  links?: PaginationLinks;

  // create method in controller
  static create<T>(data: T, statusCode: HttpStatus = HttpStatus.OK, links: PaginationLinks): ApiResponseDto<T> {
    const response = new ApiResponseDto<T>();
    response.success = true;
    response.statusCode = statusCode;
    response.message = '성공';
    response.data = data;
    response.links = links;
    return response;
  }
}
