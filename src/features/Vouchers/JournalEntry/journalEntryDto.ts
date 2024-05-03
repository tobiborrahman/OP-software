interface JournalEntryDto {
  voucherDate: string;
  entries: EntryDto[];
}

interface EntryDto {
  type: "Debit" | "Credit";
  accountId: string;
  amount: number | "";
  remarks: string;
}
