 interface GSTSlabDto {
  gstSlabID: number;
  gstSlabName: string | null;
  sgst: number | null;
  cgst: number | null;
  igst: number | null;
  additionalTax: number | null;
  composition: number | null;
  cess: number | null;
  fix: string | null;
}

export default GSTSlabDto;
