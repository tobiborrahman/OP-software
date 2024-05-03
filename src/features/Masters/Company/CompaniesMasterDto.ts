interface CompaniesMasterDto {
  companyId: string | null;
  companyName: string | null;
  address1?: string | null;
  address2?: string | null;
  state: string | null;
  district?: string | null;
  pincode?: string | null;
  mobileNo?: string | null;
  mobileNo2?: string | null;
  email?: string | null;
  natureOfBusiness?: string | null;
  gstNo?: string | null;
  panNo?: string | null;
  aadharNo?: string | null;
  city?: string | null;
  licenseNumber1?: string | null;
  licenseNumber2?: string | null;
  licenseNumber3?: string | null;
  licenseNumber4?: string | null;
  qrCodeImageURL?: string | null;
  logoUrl?: string | null;
  databaseId: string | null;
  financialYearFrom: Date | string;
  financialYearTo?: Date | string;
}
