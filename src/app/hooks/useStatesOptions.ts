// import { useState, useEffect } from "react";
// import { OptionType } from "../models/optionType";
// import agent from "../api/agent";

// type StateDto = {
//   stateCode: string;
//   stateName: string;
//   stateId: string | number;
// };

// export const useStates = (accessId: string): OptionType[] => {
//   const [stateOptions, setStateOptions] = useState<OptionType[]>([]);

//   useEffect(() => {
//     const loadStates = async () => {
//       try {
//         const response = await agent.States.getAllStatesOfCompany(accessId);
//         const formattedStates: OptionType[] = response.map(
//           (state: StateDto) => ({
//             label: `${state.stateCode} | ${state.stateName}`,
//             value: state.stateId,
//           })
//         );
//         setStateOptions(formattedStates);
//       } catch (error) {
//         console.error("Error fetching states:", error);
//       }
//     };

//     loadStates();
//   }, [accessId]); // dependency array includes accessId to re-fetch if it changes

//   return stateOptions;
// };
import { OptionType } from "../models/optionType";

export const useStates = (): OptionType[] => {
  return [
    { label: "01 | JAMMU AND KASHMIR", value: "1" },
    { label: "02 | HIMACHAL PRADESH", value: "2" },
    { label: "03 | PUNJAB", value: "3" },
    { label: "04 | CHANDIGARH", value: "4" },
    { label: "05 | UTTARAKHAND", value: "5" },
    { label: "06 | HARYANA", value: "6" },
    { label: "07 | DELHI", value: "7" },
    { label: "08 | RAJASTHAN", value: "8" },
    { label: "09 | UTTAR PRADESH", value: "9" },
    { label: "10 | BIHAR", value: "10" },
    { label: "11 | SIKKIM", value: "11" },
    { label: "12 | ARUNACHAL PRADESH", value: "12" },
    { label: "13 | NAGALAND", value: "13" },
    { label: "14 | MANIPUR", value: "14" },
    { label: "15 | MIZORAM", value: "15" },
    { label: "16 | TRIPURA", value: "16" },
    { label: "17 | MEGHALAYA", value: "17" },
    { label: "18 | ASSAM", value: "18" },
    { label: "19 | WEST BENGAL", value: "19" },
    { label: "20 | JHARKHAND", value: "20" },
    { label: "21 | ORISSA", value: "21" },
    { label: "22 | CHHATTISGARH", value: "22" },
    { label: "23 | MADHYA PRADESH", value: "23" },
    { label: "24 | GUJARAT", value: "24" },
    { label: "25 | DAMAN AND DIU", value: "25" },
    { label: "26 | DADAR AND NAGAR HAVELI", value: "26" },
    { label: "27 | MAHARASTRA", value: "27" },
    { label: "29 | KARNATAKA", value: "29" },
    { label: "30 | GOA", value: "30" },
    { label: "31 | LAKSHADWEEP", value: "31" },
    { label: "32 | KERALA", value: "32" },
    { label: "33 | TAMIL NADU", value: "33" },
    { label: "34 | PUDUCHERRY", value: "34" },
    { label: "35 | ANDAMAN AND NICOBAR", value: "35" },
    { label: "36 | TELANGANA", value: "36" },
    { label: "37 | ANDHRA PRADESH", value: "37" },
    { label: "97 | OTHER TERRITORY", value: "97" },
    { label: "96 | OTHER COUNTRY", value: "96" },
  ];
};
