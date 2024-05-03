import {
  CompanyInformation,
  getCompanyInformation,
} from "../Company/CompanyInformation";

export interface AccountDto extends CompanyInformation {
  accountID?: string; // GUID as string
  accountName: string;
  accountGroupName: string;
  accountGroupID: number;
  openingBalance: number;
  debitCredit: string;
  cityId?: number | null;
  printAddress: string;
  partyType: string;
  stateId: number | null;
  gstNo: string;
  panNo: string;
  contactPerson: string;
  mobileNo: string;
  mobileNo2: string;
  gstSlabId: number | null;
  opUnit: number;
  opWeight: number;
  opRate: number;
  grossProfit: number;
  itemUnitId: number | null;
  aadharNo: string;
  sharePercentage: number;
  depreciationPercentage: number;
  fix: string;
  cessPer: number;
  distance: string;
  area: string;
  remarks: string;
  emailId: string | null;
  capitalSalary: number;
  lastYearGrossProfitPercentage: number;
  hsnCode: string;
  verifiedGSTNo: string;
  dlNo1: string;
  dlNo2: string;
  marginPercentage: number;
  priceToApply: string;
  discountPercentage: number;
  fatherName: string;
  grandFatherName: string;
  farmerRegisterID: string;
  bankName: string;
  bankAccountNo1: string;
  bankIFSCCode1: string;
  bankName2: string;
  bankAccountNo2: string;
  bankIFSCCode2: string;
  farmerOwnLand: string;
  farmerLeaseLand: string;
  farmerGuarantorName: string;
  farmerDocumentUrls: string;
  measurement?: string;
}
export function getDefaultFormData(): AccountDto {
  // Fetch the latest company information from sessionStorage
  const companyInfo = getCompanyInformation();

  // Define the base structure of your form data with default values
  let defaultFormData: AccountDto = {
    accountName: "",
    accountGroupName: "",
    accountGroupID: 0,
    openingBalance: 0,
    debitCredit: "",
    cityId: null,
    printAddress: "",
    partyType: "",
    stateId: null,
    gstNo: "",
    panNo: "",
    contactPerson: "",
    mobileNo: "",
    mobileNo2: "",
    gstSlabId: null,
    opUnit: 0,
    opWeight: 0,
    opRate: 0,
    grossProfit: 0,
    itemUnitId: null,
    aadharNo: "",
    sharePercentage: 0,
    depreciationPercentage: 0,
    fix: "",
    cessPer: 0,
    distance: "",
    area: "",
    remarks: "",
    emailId: null,
    capitalSalary: 0,
    lastYearGrossProfitPercentage: 0,
    hsnCode: "",
    verifiedGSTNo: "",
    dlNo1: "",
    dlNo2: "",
    marginPercentage: 0,
    priceToApply: "",
    discountPercentage: 0,
    fatherName: "",
    grandFatherName: "",
    farmerRegisterID: "",
    bankName: "",
    bankAccountNo1: "",
    bankIFSCCode1: "",
    bankName2: "",
    bankAccountNo2: "",
    bankIFSCCode2: "",
    farmerOwnLand: "",
    farmerLeaseLand: "",
    farmerGuarantorName: "",
    farmerDocumentUrls: "",
    measurement: "",
    // Additional fields from CompanyInformation
    companyId: "",
    accessId: "",
    currentFinancialYear: new Date(),
    companyName: "",
    companyGSTIN: "",
    companyPAN: "",
    companyState: "",
  };

  // If there is company information, merge it into the default form data
  if (companyInfo) {
    defaultFormData = { ...defaultFormData, ...companyInfo };
  }

  return defaultFormData;
}

export interface AccountDtoForDropDownList {
  accountID: string;
  accountName: string;
  address: string;
  gstNo: string;
  currentBalance: number;
  debitCredit: string;
  accountGroupName: string;
  partyType: string;
}
