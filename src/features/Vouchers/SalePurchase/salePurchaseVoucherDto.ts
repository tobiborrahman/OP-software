import { ItemDetailDto } from "../../Masters/Item/ItemDto";
import { VoucherTypeEnum } from "../VoucherCommon/voucherTypeEnum";

export interface ItemSalePurchaseVoucherDto {
  voucherId: string; // Guid in C# is string in TypeScript
  voucherTypeId: VoucherTypeEnum; // Assuming VoucherType is an enum or similar structure
  billBookId: number;
  voucherDate: string | Date; // DateTime in C# can be represented as string or Date in TypeScript
  paymentMode: string;
  accountId: string;
  accountName: string;
  voucherNoPrefix?: string;
  voucherNo?: string;
  remarks?: string;
  netInvoiceValue?: number;
  totalSGST?: number;
  totalCharges?: number;
  totalCGST?: number;
  totalIGST?: number;
  totalRoundOff?: number;
  transportDetailDto?: TransportDetailDto;
  customerDetailDto?: CustomerDetailDto;
  items: ItemsInVoucherDto[];
  otherCharges?: OtherChargesDto[];
}

export interface TransportDetailDto {
  deliveryAddress?: string;
  firmName?: string;
  gstNo?: string;
  contactPersonName?: string;
  contactPersonMobileNumber?: string;

  transporterName?: string;
  vehicleNumber?: string;
  driverName?: string;
  grNo?: string;
  grDate?: string;
  brokerName?: string;
}

export interface CustomerDetailDto {
  customerName?: string;
  customerAddress?: string;
  customerContactNo?: string;
  customerGSTNo?: string;
  customerPAN?: string;
  customerAadhar?: string;
}

export interface ItemsInVoucherDto {
  itemId: number;
  itemDetail?: ItemDetailDto;
  salePurAccountID?: string;
  batchId?: number;
  mainQty: number;
  altQty: number;
  free: number;
  rate?: number;
  rateWithoutGST: number;
  rateIncludingGST: number;
  pricePer?: string;
  basicAmount: number;
  discountPercentage: number;
  discountAmount: number;
  additionalDiscount: number;
  sGST: number;
  cGST: number;
  iGST: number;
  additionalTax1: number;
  additionalTax2: number;
  netAmount: number;
}

export interface OtherChargesDto {
  otherChargesId: number;
  accountId: string;
  onValue: number;
  chargesPercentage: number;
  addedOrSubtracted?: string;
  grossAmount: number;
  sGST: number;
  cGST: number;
  iGST: number;
  netCharges: number;
}
const defaultItemDetail: ItemDetailDto = {
  itemId: 0,
  itemName: "",
  gstSlabID: 0,
  gstSlab: undefined,
  salePurAccountID: "",
  additionalTax1AccountId: "",
  additionalTax2AccountId: "",
  itemCompany: "",
  hsnCode: "",
  conversion: 0,
  purchasePrice: 0,
  mainRate: 0,
  alternateRate: 0,
  cessPercentage: 0,
  itemDiscountOnSalePercentage: 0,
  itemDiscountOnPurchasePercentage: 0,
  applyGstDiscountOnSale: "",
  applyGstDiscountOnPurchase: "",
  salePrice: 0,
  mainUnitID: 0,
  mainUnitName: "",
  alternateUnitID: 0,
  alternateUnitName: "",
  applySalesPriceOn: "",
  applyPurchasePriceOn: "",
  useAdditionalItem: "",
  useBatchNumber: "",
  useSerialNumber: "",
  extraColumn1: "",
  extraColumn2: "",
  extraColumn3: "",
  extraColumn4: "",
  extraColumn5: "",
  extraColumn6: "",
  extraColumn7: "",
  extraColumn8: "",
  extraColumn9: "",
  extraColumn10: "",
  batchNumbers: [],
};

export const defaultItems: ItemsInVoucherDto = {
  itemId: 0,
  salePurAccountID: "",
  batchId: 0,
  mainQty: 0,
  altQty: 0,
  free: 0,
  rate: 0,
  rateWithoutGST: 0,
  rateIncludingGST: 0,
  pricePer: "",
  basicAmount: 0,
  discountPercentage: 0,
  discountAmount: 0,
  additionalDiscount: 0,
  sGST: 0,
  cGST: 0,
  iGST: 0,
  additionalTax1: 0,
  additionalTax2: 0,
  netAmount: 0,
  itemDetail: defaultItemDetail,
};
export const defaultTransportDetails: TransportDetailDto = {
  transporterName: "",
  vehicleNumber: "",
  driverName: "",
  grNo: "",
  grDate: "",
  deliveryAddress: "",
  firmName: "",
  gstNo: "",
  contactPersonName: "",
  contactPersonMobileNumber: "",
  brokerName: "",
};

// Define default values for the customer details form
export const defaultCustomerDetails: CustomerDetailDto = {
  customerName: "",
  customerAddress: "",
  customerContactNo: "",
  customerGSTNo: "",
  customerPAN: "",
  customerAadhar: "",
};
export const defaultBillSummary = {
  totalMainQty: 0,
  totalAltQty: 0,
  totalBasicAmount: 0,
  totalDiscount: 0,
  totalSGST: 0,
  totalCGST: 0,
  totalIGST: 0,
  totalTax: 0,
  totalCharges: 0,
  totalRoundOff: 0,
  netBillAmount: 0,
};
