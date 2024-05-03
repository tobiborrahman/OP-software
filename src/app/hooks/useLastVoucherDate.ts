import { FinancialYearDto } from "../../features/Masters/FinancialYear/financialYearDto";
import { VoucherTypeEnum } from "../../features/Vouchers/VoucherCommon/voucherTypeEnum";
import agent from "../api/agent";
import toast from "react-hot-toast";

const getLastVoucherDate = async (
  accessId: string,
  voucherType: VoucherTypeEnum | undefined | null,
  financialYear: FinancialYearDto | null
): Promise<Date | null> => {
  if (!financialYear || voucherType === undefined) {
    toast.error(
      "Missing financialYear or voucherType. Cannot fetch last voucher date."
    );
    return null;
  }
  try {
    const lastVoucherDate = await agent.Vouchers.getLastVoucherDate(
      accessId,
      financialYear,
      voucherType
    );
    return lastVoucherDate || new Date(financialYear.financialYearFrom);
  } catch (error) {
    console.error("Error fetching last voucher date:", error);
    return financialYear ? new Date(financialYear.financialYearFrom) : null;
  }
};

export default getLastVoucherDate;
