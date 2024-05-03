export enum VoucherTypeEnum {
  Payment = 1,
  Receipt = 2,
  BankEntry = 3,
  JournalEntry = 4,
  ItemSale = 5,
  ItemPurchase = 6,
  Account = 7,
  GenSale = 8,
}

export function getVoucherTypeString(voucherType: VoucherTypeEnum): string {
  const typeMap: { [key in VoucherTypeEnum]: string } = {
    [VoucherTypeEnum.Payment]: "Payment",
    [VoucherTypeEnum.Receipt]: "Receipt",
    [VoucherTypeEnum.BankEntry]: "Bank Entry",
    [VoucherTypeEnum.JournalEntry]: "Journal Entry",
    [VoucherTypeEnum.ItemSale]: "Item Sale",
    [VoucherTypeEnum.ItemPurchase]: "Item Purchase",
    [VoucherTypeEnum.Account]: "Account",
    [VoucherTypeEnum.GenSale]: "Gen Sale",
  };

  return typeMap[voucherType] || "";
}
