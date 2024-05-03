import GSTSlabDto from "../GSTSlab/gstSlabDto";

export interface ItemFormDto {
  itemId?: number;
  gstSlabID: number;
  itemCategoryID?: number | null;
  itemCompanyID?: number | null;
  itemGodownID?: number | null;
  mainUnitID?: number | null;
  alternateUnitID?: number;
  salePurAccountID: string | null;
  additionalTax1AccountId?: string;
  additionalTax2AccountId?: string;
  itemName: string;
  applyPurchasePriceOn?: string;
  applySalesPriceOn?: string;
  itemPacking?: string;
  hsnCode?: string;
  conversion?: number;
  purchasePrice?: number;
  salePrice?: number;
  mainOpeningStockQty?: number;
  mainRate?: number;
  mainOpeningAmount?: number;
  alternateOpeningStockQty?: number;
  alternateRate?: number;
  alternateOpeningAmount?: number;
  cessPercentage?: number;
  additionalTax1Percentage?: number;
  additionalTax2Percentage?: number;
  goodsService?: string;
  useSerialNumber?: string;
  useBatchNumber?: string;
  useAdditionalItem?: string;
  itemDiscountOnSalePercentage?: string;
  itemDiscountOnPurchasePercentage?: string;
  applyGSTDiscountOnSale: string;
  applyGSTDiscountOnPurchase: string;
  extraColumn1?: string;
  extraColumn2?: string;
  extraColumn3?: string;
  extraColumn4?: string;
  extraColumn5?: string;
  extraColumn6?: string;
  extraColumn7?: string;
  extraColumn8?: string;
  extraColumn9?: string;
  extraColumn10?: string;
  useAlternateUnit: string;
}

export interface ItemDropDownListDto {
  itemId: number;
  itemName: string;
  openingStock?: number;
  netPurQty?: number;
  netSaleQty?: number;
  balance?: number;
}
export interface ItemDetailDto {
  itemId: number;
  itemName?: string;
  gstSlabID: number;
  gstSlab?: GSTSlabDto;
  salePurAccountID: string;
  additionalTax1AccountId?: string;
  additionalTax2AccountId?: string;
  itemCompany?: string;
  hsnCode?: string;
  conversion?: number;
  purchasePrice?: number;
  mainRate?: number;
  alternateRate?: number;
  cessPercentage?: number;
  itemDiscountOnSalePercentage?: number;
  itemDiscountOnPurchasePercentage?: number;
  applyGstDiscountOnSale?: string;
  applyGstDiscountOnPurchase?: string;
  salePrice?: number;
  mainUnitID?: number;
  mainUnitName?: string;
  alternateUnitID?: number;
  alternateUnitName?: string;
  applySalesPriceOn?: string;
  applyPurchasePriceOn?: string;
  useAdditionalItem?: string;
  useBatchNumber?: string;
  useSerialNumber?: string;
  extraColumn1?: string;
  extraColumn2?: string;
  extraColumn3?: string;
  extraColumn4?: string;
  extraColumn5?: string;
  extraColumn6?: string;
  extraColumn7?: string;
  extraColumn8?: string;
  extraColumn9?: string;
  extraColumn10?: string;
  batchNumbers?: BatchNumberDto[];
}

export interface BatchNumberDto {
  batchId: number;
  batchNo?: string;
  itemId: number;
  manufacturingDate?: string;
  expiryDate?: string;
  mrp: number;
  priceToStockList: number;
  priceToRetailer: number;
  costPrice: number;
  openingPacks: number;
  openingLoose: number;
  openingValue: number;
}
