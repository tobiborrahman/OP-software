import { VoucherTypeEnum } from "../VoucherCommon/voucherTypeEnum";

export interface PaymentAndReceiptDto {
  voucherId?: string | null;
  voucherType: VoucherTypeEnum;
  voucherDate: Date | string;
  receiptPrefix?: string;
  receiptNumber?: string;
  accountId: string;
  accountName?: string;
  basicAmount: number;
  discountAmount: number;
  netAmount: number;
  remarks?: string;
}

export interface PaymentAndReceiptEntriesAndTotalsDto {
  entries: PaymentAndReceiptDto[];
  totals: {
    totalBasicAmount: 0;
    totalDiscountAmount: 0;
    totalNetAmount: 0;
  };
}
