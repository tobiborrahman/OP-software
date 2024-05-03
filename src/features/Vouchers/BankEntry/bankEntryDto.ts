export interface BankEntryDto {
  voucherId?: string | null;
  voucherDate: Date | string;
  bankAccountId: string;
  bankName?: string | null;
  bankEntryType: string;
  accountId: string;
  accountName?: string | null;
  amount: number;
  expense: number;
  netAmount: number;
  chequeNumber?: string | null;
  chequeDate?: string | null;
  remarks?: string | null;
}

export interface BankEntriesAndTotalsDto {
  entries: BankEntryDto[];
  totals: {
    totalAmount: 0;
    totalExpenses: 0;
    totalNetAmount: 0;
  };
}
