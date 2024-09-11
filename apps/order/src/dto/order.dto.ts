export class OrderDto {
  /**
   * 주문 ID
   * @example "29b04122-3c21-4703-bf84-0e7f5f28f176"
   */
  id: string;

  /**
   * 주문 번호
   * @example "S-1726001968-863452"
   */
  orderNumber: string;

  /**
   * 주문 유형
   * @example "구매"
   */
  type: string;

  /**
   * 사용자 ID
   * @example "f565b0c5-a02b-409c-beb5-052cc7088303"
   */
  userId: string;

  /**
   * 주문 상태
   * @example "주문 완료"
   */
  status: string;

  /**
   * 상품 ID
   * @example "f813d90a-f899-4f37-9d8d-960f5252fbaf"
   */
  productId: string;

  /**
   * 주문 수량
   * @example 0.15
   */
  quantity: number;

  /**
   * 총 가격
   * @example 150000.00
   */
  totalPrice: number;

  /**
   * 배송 주소
   * @example "string"
   */
  shippingAddress: string;

  /**
   * 수령인 이름
   * @example "홍길동"
   */
  shippingName: string;

  /**
   * 수령인 전화번호
   * @example "010-1234-5678"
   */
  shippingPhone: string;

  /**
   * 배송 메모
   * @example "문 앞에 놓아주세요"
   */
  shippingMemo?: string | null;

  /**
   * 주문 생성 시간
   * @example "2024-09-10T11:59:28.418Z"
   */
  createdAt: Date;

  /**
   * 주문 수정 시간
   * @example "2024-09-10T11:59:28.418Z"
   */
  updatedAt: Date;
}
