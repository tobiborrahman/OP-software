import { router } from "../../../app/router/Router";

export interface CompanyInformation {
  companyId: string;
  accessId: string;
  currentFinancialYear: Date;
  companyName?: string;
  companyGSTIN?: string;
  companyPAN?: string;
  companyState: string;
}

/**
 * Redirects to the "select-company" page. Intended to be called within
 * useEffect hooks or event handlers to avoid rendering issues.
 */
const redirectToSelectCompany = () => {
  router.navigate("/select-company");
};

/**
 * Attempts to retrieve the stored company information from sessionStorage.
 * Does not redirect if the information is missing, allowing calling code to decide action.
 */
export const getCompanyInformation = (): CompanyInformation | null => {
  const companyInfoJson = sessionStorage.getItem("selectedCompanyInformation");
  if (!companyInfoJson) return null;

  try {
    const companyInfo: CompanyInformation = JSON.parse(companyInfoJson);
    companyInfo.currentFinancialYear = new Date(
      companyInfo.currentFinancialYear
    );
    return companyInfo;
  } catch (error) {
    console.error(
      "Error parsing company information from sessionStorage:",
      error
    );
    return null;
  }
};

/**
 * Retrieves the accessId if available, without redirecting.
 */
export const getAccessId = (): string | null => {
  const companyInfo = getCompanyInformation();
  return companyInfo ? companyInfo.accessId : null;
};

/**
 * Retrieves the accessId if available, and redirects to "select-company" if not.
 * Intended for use where an accessId is required to proceed.
 */
export const getAccessIdOrRedirect = (): string => {
  const companyInfo = getCompanyInformation();
  if (!companyInfo || !companyInfo.accessId) {
    redirectToSelectCompany();
    return "";
  }
  return companyInfo.accessId;
};

/**
 * Retrieves the company information if available, and redirects to "select-company" if not.
 * Intended for use where company information is required to proceed.
 */
export const getCompanyInformationOrRedirect =
  (): CompanyInformation | null => {
    const companyInfo = getCompanyInformation();
    if (!companyInfo) {
      redirectToSelectCompany();
    }
    return companyInfo;
  };

/**
 * Deletes the stored company information from sessionStorage.
 */
export const deleteStoredCompanyInformation = (): void => {
  sessionStorage.removeItem("selectedCompanyInformation");
};
