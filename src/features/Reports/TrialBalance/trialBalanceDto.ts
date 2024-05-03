interface TrialBalanceDto {
  accountGroups: TrialBalanceAccountGroupsDto[];
  grandTotalDebitOpening: number;
  grandTotalCreditOpening: number;
  grandTotalDebitTransaction: number;
  grandTotalCreditTransaction: number;
  grandTotalDebitClosing: number;
  grandTotalCreditClosing: number;
  openingBalanceDifference: number;
  closingBalanceDifference: number;
}

interface TrialBalanceAccountGroupsDto {
  accountGroupId: number;
  accountGroupName: string;
  debitOpeningBalance?: number; // Optional to accommodate nulls
  creditOpeningBalance?: number;
  debitTransactionBalance?: number;
  creditTransactionBalance?: number;
  debitClosingBalance?: number;
  creditClosingBalance?: number;
  accounts: TrialBalanceAccountDto[];
}

interface TrialBalanceAccountDto {
  accountId: string; // GUID is treated as string in TS/JS
  accountName?: string; // Optional to accommodate nulls
  debitOpeningBalance?: number;
  creditOpeningBalance?: number;
  debitTransactionBalance?: number;
  creditTransactionBalance?: number;
  debitClosingBalance?: number;
  creditClosingBalance?: number;
}
