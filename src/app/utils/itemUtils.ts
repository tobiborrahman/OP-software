import { OptionType } from "../models/optionType";
import agent from "../api/agent"; // Assuming this is where your API calls are defined
import { formatDateForBackend } from "./dateUtils";
import toast from "react-hot-toast";
import { ItemDropDownListDto } from "../../features/Masters/Item/ItemDto";

const transformItemToOption = (item: ItemDropDownListDto): OptionType => {
  const labelParts = [
    `${item.itemName}`.padEnd(30, " "),
    item.openingStock ? `Op. Stock: ${item.openingStock}` : "",
    item.netPurQty ? `Purchases: ${item.netPurQty}` : "",
    item.netSaleQty ? `Sales: ${item.netSaleQty}` : "",
    item.balance ? `Balance: ${item.balance}` : "",
  ].filter((part) => part !== ""); // Remove empty parts

  return {
    value: item.itemId,
    label: labelParts.join(" | "),
  };
};

// Fetch and transform function
export const fetchItemListForDropdown = async (
  accessId: string,
  financialYearFrom: string | Date,
  currentVoucherDate: Date | string
): Promise<OptionType[]> => {
  try {
    const itemList: ItemDropDownListDto[] =
      await agent.Item.getItemsForDropDownList(
        accessId,
        financialYearFrom.toString(),
        formatDateForBackend(currentVoucherDate)
      );
    return itemList.map(transformItemToOption);
  } catch (error) {
    toast.error("Failed to load items.");
    return [];
  }
};
