import { useState, useEffect } from "react";
import { OptionType } from "../models/optionType";
import agent from "../api/agent";
import { AccountGroupDto } from "../../features/Masters/AccountGroup/accountGroupDto";
import handleApiErrors from "../errors/handleApiErrors";

export const useAccountGroups = (accessId: string): OptionType[] => {
  const [accountGroupOptions, setAccountGroupOptions] = useState<OptionType[]>(
    []
  );

  useEffect(() => {
    const getAccountGroups = async () => {
      if (!accessId) return;

      try {
        const response = await agent.AccountGroup.getAllAccountGroups(accessId);
        const formattedGroups: OptionType[] = response.map(
          (accountGroup: AccountGroupDto) => ({
            label: `${accountGroup.groupName} | ${accountGroup.underGroup}`,
            value: accountGroup.groupID,
          })
        );
        setAccountGroupOptions(formattedGroups);
      } catch (error) {
        handleApiErrors(error);
      }
    };

    getAccountGroups();
  }, [accessId]); // dependency array includes accessId to re-fetch if it changes

  return accountGroupOptions;
};
