import { OptionType } from "../models/optionType";

export const useDebitCreditOptions = (): OptionType[] => {
  return [
    { label: "Debit", value: "Debit" },
    { label: "Credit", value: "Credit" },
  ];
};

// export const useDebitCreditOptions = (accessId: string): OptionType[] => {
//   const [debitCreditOptions, setDebitCreditOptions] = useState<OptionType[]>(
//     []
//   );

//   useEffect(() => {
//     const loadDebitCreditOptions = async () => {
//       try {
//         const response = await agent.Account.getDebitCreditOptions(accessId);
//         const formattedOptions: OptionType[] = response.map(
//           (option: string) => ({
//             label: option,
//             value: option,
//           })
//         );
//         setDebitCreditOptions(formattedOptions);
//       } catch (error) {
//         console.error("Error fetching debit/credit options:", error);
//       }
//     };

//     loadDebitCreditOptions();
//   }, []);

//   return debitCreditOptions;
// };
