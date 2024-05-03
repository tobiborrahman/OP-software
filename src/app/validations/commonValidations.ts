// validations.ts

export const gstValidation = (gstNo: string): string | undefined => {
  if (!gstNo) {
    return undefined; // No validation if empty
  }
  const gstPattern = /^\d{2}[A-Z]{5}\d{4}[A-Z]{1}[A-Z\d]{1}[Z]{1}[A-Z\d]{1}$/i;
  if (!gstPattern.test(gstNo)) {
    return "Invalid GST number format";
  }
  return undefined;
};

export const extractPANFromGSTIN = (gstin: string): string | null => {
  if (gstin && gstin.length === 15) {
    return gstin.substring(2, 12);
  }
  return null;
};
export const extractStateCodeFromGSTIN = (gstin: string): string | null => {
  if (gstin && gstin.length >= 2) {
    return gstin.substring(0, 2);
  }
  return null;
};
