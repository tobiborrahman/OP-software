import { AccountDtoForDropDownList } from "../../features/Masters/Account/accountDto";
import { OptionType } from "../models/optionType";

export const transformAccountToOption = (
  account: AccountDtoForDropDownList
): OptionType => {
  let labelParts = [account.accountName];
  if (account.address) labelParts.push(account.address);
  if (account.gstNo) labelParts.push(`${account.gstNo}`);
  if (
    account.currentBalance !== null &&
    account.currentBalance !== undefined &&
    account.currentBalance !== 0
  ) {
    labelParts.push(
      `Balance: ${account.currentBalance} ${account.debitCredit || ""}`
    );
  }
  return {
    value: account.accountID,
    label: labelParts.join(" | "),
  };
};
