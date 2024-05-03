import agent from "../api/agent";
import { OptionType } from "../models/optionType";

interface HSNCodeDto {
  hsnCode: string;
  hsnDescription: string;
}
export const useHSNCodesOrSAC = async (
  accessId: string,
  inputValue: string
): Promise<OptionType[]> => {
  if (!inputValue || inputValue.length < 3) {
    return [];
  }
  try {
    const hsnCodes = await agent.Item.getHSNCodesByPrefix(accessId, inputValue);
    return hsnCodes.map((code: HSNCodeDto) => ({
      value: code.hsnCode,
      label: `${code.hsnCode} - ${code.hsnDescription}`,
    }));
  } catch (error) {
    console.error("Error fetching HSN/SAC codes:", error);
    return [];
  }
};
