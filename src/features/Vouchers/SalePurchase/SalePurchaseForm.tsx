import { Suspense, useEffect, useRef, useState } from "react";
import { useAppSelector } from "../../../app/store/configureStore";
import { getAccessIdOrRedirect } from "../../Masters/Company/CompanyInformation";
import { selectCurrentFinancialYear } from "../../Masters/FinancialYear/financialYearSlice";
import { VoucherTypeEnum, getVoucherTypeString } from "../VoucherCommon/voucherTypeEnum";
import { FieldValues, useFieldArray, useForm } from "react-hook-form";
import { CustomerDetailDto, ItemSalePurchaseVoucherDto, ItemsInVoucherDto, TransportDetailDto, defaultBillSummary, defaultCustomerDetails, defaultItems, defaultTransportDetails } from "./salePurchaseVoucherDto";
import getLastVoucherDate from "../../../app/hooks/useLastVoucherDate";
import toast from "react-hot-toast";
import FormNavigator from "../../../app/components/FormNavigator";
import handleApiErrors from "../../../app/errors/handleApiErrors";
import CommonCard from "../../../app/components/CommonCard";
import { Col, Row, Table } from "react-bootstrap";
import agent from "../../../app/api/agent";
import { OptionType } from "../../../app/models/optionType";
import { CustomDropdown, CustomDateInputBox, CommonModal, CustomInput, CustomButton } from "../../../app/components/Components";
import SaleBillBookForm from "../../Masters/BillBook/SaleBillBookForm";
import { formatDateForBackend, validateDate } from "../../../app/utils/dateUtils";
import { AccountDtoForDropDownList } from "../../Masters/Account/accountDto";
import { transformAccountToOption } from "../../../app/utils/accountUtils";
import AccountForm from "../../Masters/Account/AccountForm";
import ItemForm from "../../Masters/Item/ItemForm";
import { fetchItemListForDropdown } from "../../../app/utils/itemUtils";
import { ItemDetailDto } from "../../Masters/Item/ItemDto";
import './salepurchase.scss'
import { formatNumberIST } from "../../../app/utils/numberUtils";
import TransportAndShippingDetailModal from "./TransportAndShippingDetailModal";
import CustomerDetailModal from "./CustomerDetailModal";


const PAYMENT_MODE_OPTIONS = [
    { label: "Cash", value: "CASH" },
    { label: "Credit", value: "CREDIT" },
    { label: "Bank | UPI", value: "BANK" },
];
interface SalePurchaseFormProps {
    voucherType: VoucherTypeEnum;
    voucherId?: string;
    isInModal?: boolean;
    onSuccessfulSubmit?: () => void;
}

export function SalePurchaseForm({ voucherType, voucherId = undefined, isInModal = false }: SalePurchaseFormProps) {

    const accessId = getAccessIdOrRedirect();
    const financialYear = useAppSelector(selectCurrentFinancialYear);
    const [lastVoucherDate, setLastVoucherDate] = useState<Date | null>(null);
    const [billBookList, setBillBookList] = useState<OptionType[]>([]);
    const [showBillBookModal, setShowBillBookModal] = useState(false);
    const [selectedTaxType, setSelectedTaxType] = useState<string>('');
    const [allAccounts, setAllAccounts] = useState<AccountDtoForDropDownList[]>([]);
    const [showAccountModal, setShowAccountModal] = useState(false);
    const [showItemModal, setShowItemModal] = useState(false);
    const [displayedAccounts, setDisplayedAccounts] = useState<AccountDtoForDropDownList[]>([]);
    const [itemDropDownList, setItemDropDownList] = useState<OptionType[]>([]);
    const [showInclusiveRateInput, setShowInclusiveRateInput] = useState<number | null>(null);
    const [inclusiveRate, setInclusiveRate] = useState("");
    const [focusInclusiveRateInput, setFocusInclusiveRateInput] = useState<string | null>(null);
    const [useAltQty, setUseAltQty] = useState<boolean>(false);
    const [useFree] = useState<boolean>(false);

    const [showTransportModal, setShowTransportModal] = useState(false);
    const [transportDetails, setTransportDetails] = useState<TransportDetailDto>(defaultTransportDetails);
    const updateParentStateOfTransportDetails = (data: TransportDetailDto) => {
        setTransportDetails(data);
    };

    const [showCustomerDetailModal, setShowCustomerDetailModal] = useState(false);
    const [customerDetail, setCustomerDetail] = useState<CustomerDetailDto>(defaultCustomerDetails);
    const updateParentStateOfCustomerDetail = (data: CustomerDetailDto) => {
        setCustomerDetail(data);
    };

    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const scrollToBottom = () => {
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
        }
    };

    const [billSummary, setBillSummary] = useState(defaultBillSummary);
    const [focusRemarks, setFocusRemarks] = useState(false);
    const [focusBillNo, setFocusBillNo] = useState(false);
    useEffect(() => {
        if (focusRemarks) {
            const remarksInput = document.getElementById('remarks'); // Get the element
            console.log(remarksInput);

            if (remarksInput) {  // Check if the element is not null
                remarksInput.focus(); // Safely call focus
                setFocusRemarks(false);  // Reset focus state to prevent re-focusing on subsequent renders
            }
        }
    }, [focusRemarks]);
    useEffect(() => {
        const handleKeyPress = (event: KeyboardEvent) => {
            if ((event.ctrlKey) && event.key === 't') {
                event.preventDefault();
                setShowTransportModal(true);
            }
        };

        // Add the event listener to the window object
        window.addEventListener('keydown', handleKeyPress);

        // Cleanup the event listener when the component unmounts
        return () => {
            window.removeEventListener('keydown', handleKeyPress);
        };
    }, []);



    //const [useDiscount, setUseDiscount] = useState<boolean>(false);
    const [pricePerOptions, setPricePerOptions] = useState<{ [key: number]: OptionType[] }>({});
    const [askForCustomerDetailWhenCash] = useState<boolean>(true);
    //const [showAltQtyAndPricePer, setShowAltQtyAndPricePer] = useState<number | null>(null);

    const [partyGST, setPartyGST] = useState('');
    const [isAccountOutOfState, setIsAccountOutOfState] = useState<boolean>(false);
    const { register, handleSubmit, setValue, getValues, watch, control, reset, formState: { errors } } = useForm<FieldValues>({
        mode: "all",
        defaultValues: {
            items: [defaultItems]
        }
    });
    const { fields, append, remove } = useFieldArray({
        control,
        name: 'items',
    });

    const watchedItems = watch('items');

    const handleDeleteRow = (index: number) => {
        if (window.confirm("Are you sure you want to delete this row?")) {
            remove(index);
            if (fields.length === 1) {
                append(defaultItems); // Append a new row only if there are no other rows left
            }
        }
    };

    useEffect(() => {
        calculateBillSummary();
    }, [watchedItems]);

    const paymentMode = watch('paymentMode', '');
    const voucherDate = watch("voucherDate");

    useEffect(() => {
        if (accessId && financialYear && voucherType !== undefined && voucherId == undefined) {
            getLastVoucherDate(accessId, voucherType, financialYear)
                .then(date => {
                    setLastVoucherDate(date);
                })
                .catch(error => {
                    console.error('Error fetching last voucher date:', error);
                    toast.error('Failed to fetch last voucher date.');
                });

        }
    }, [accessId, financialYear, voucherType, voucherId]);

    const loadBillBookOptions = async () => {
        try {
            const response = await agent.BillBook.getAllBillBooks(accessId);
            const formattedOptions = response.map((billBook: BillBookDto) => ({
                label: `${billBook.bookName} | ${billBook.taxType}`,
                value: billBook.billBookId,
            }));

            setBillBookList(formattedOptions);
        } catch (error) {
            console.error("Error fetching measurements:", error);
        }
    };

    useEffect(() => {
        loadBillBookOptions();
    }, [accessId]);

    const handleBillBookChange = async (selectedOption: OptionType | null) => {
        if (selectedOption != null) {
            const selectedBillBook = billBookList.find(billBook => billBook.value === selectedOption.value);
            if (selectedBillBook) {
                const taxTypePart = selectedBillBook.label.split('|')[1]?.trim();
                const taxType = taxTypePart.includes("Exclusive") ? "Exclusive" : "Inclusive";
                setSelectedTaxType(taxType);
            } else {
                setSelectedTaxType("Inclusive");
            }
            setValue("billBookId", selectedOption.value);
            const voucherNo = watch("voucherNo");
            if (voucherNo) return;
            try {
                const lastVoucherInfo = await agent.SalePurchase.getLastVoucherInfoBySaleBillBookId(accessId, selectedOption.value);
                let { LastVoucherNumber, LastVoucherPrefix } = lastVoucherInfo;
                LastVoucherNumber = String(parseInt(LastVoucherNumber) || 0);
                let nextVoucherNumber = parseInt(LastVoucherNumber) + 1;
                const fullVoucherNumber = `${LastVoucherPrefix || ''}${nextVoucherNumber}`;
                setValue("voucherNo", fullVoucherNumber);
            } catch (error) {
                console.error("Error fetching last voucher info:", error);
                const fullVoucherNumber = `1`;
                setValue("voucherNo", fullVoucherNumber);
            }
        }
    };
    const handleAccountChange = async (selectedOption: OptionType | null) => {
        if (selectedOption != null) {
            const selectedAccount = allAccounts.find(account => account.accountID === selectedOption.value);
            if (selectedAccount) {
                const isOutsideState = selectedAccount.partyType.includes('Out of State');
                setIsAccountOutOfState(isOutsideState);
                const partyTypeWithGST = `${selectedAccount.gstNo || ''} ${selectedAccount.partyType}`;
                setPartyGST(partyTypeWithGST || '');
            }
            setValue("accountId", selectedOption.value);
        }
    };

    const fetchAccounts = async (currentVoucherDate: Date | string) => {
        if (!financialYear) return Promise.resolve();
        const financialYearFrom = financialYear.financialYearFrom;
        try {
            const accounts = await agent.SalePurchase.getAccountsForDropDownListSalePurchase(
                accessId,
                financialYearFrom.toString(),
                formatDateForBackend(currentVoucherDate),
            );
            setAllAccounts(accounts);
            return Promise.resolve();
        } catch (error) {
            toast.error('Failed to fetch accounts for dropdown.');
            console.error(error);
            return Promise.reject();
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            if (voucherDate && validateDate(voucherDate) && financialYear?.financialYearFrom) {
                fetchAccounts(voucherDate);
                const options = await fetchItemListForDropdown(accessId, financialYear.financialYearFrom, voucherDate);
                setItemDropDownList(options);
            }
        };
        fetchData();
    }, [accessId, voucherDate, financialYear, voucherType]);


    useEffect(() => {
        let filteredAccounts: AccountDtoForDropDownList[] = [];
        if (paymentMode.toLowerCase().includes("cash")) {
            const cashAccount = allAccounts.find(acc => acc.accountName === "CASH");
            const otherAccounts = allAccounts.filter(acc => acc.accountName !== "CASH");
            if (cashAccount) {
                filteredAccounts = [cashAccount, ...otherAccounts];
                setValue('accountId', cashAccount.accountID);
                if (askForCustomerDetailWhenCash && cashAccount) {
                    setFocusBillNo(true);
                    setTimeout(() => {
                        setShowCustomerDetailModal(true);
                        setFocusBillNo(false);
                    }, 100);

                }
            } else {
                filteredAccounts = otherAccounts;
            }
        } else if (paymentMode.toLowerCase().includes("credit")) {
            filteredAccounts = allAccounts.filter(account => account.accountGroupName !== 'BANK ACCOUNTS' && account.accountGroupName !== 'CASH-IN-HAND');
        } else if (paymentMode.toLowerCase().includes("upi") || paymentMode.toLowerCase().includes("bank")) {
            filteredAccounts = allAccounts.filter(account => account.accountGroupName === 'BANK ACCOUNTS');
        }
        setDisplayedAccounts(filteredAccounts);
    }, [paymentMode, allAccounts, setValue]);


    const fetchItemDetails = async (itemId: number, index: number) => {

        setValue(`items[${index}]`, {
            mainQty: "",
            altQty: "",
            rate: "",
            basicAmount: "",
            discountPercentage: "",
            discountAmount: "",
            cGST: "",
            sGST: "",
            iGST: "",
            netAmount: "",
            free: "",
            pricePer: "",
            itemDetail: {}
        });
        setPricePerOptions(prevOptions => ({
            ...prevOptions,
            [index]: []
        }))

        try {
            const itemDetails: ItemDetailDto = await agent.Item.getItemDetailById(accessId, itemId);
            setValue(`items[${index}].itemDetail`, itemDetails);
            setValue(`items[${index}].itemId`, itemDetails.itemId);
            setValue(`items[${index}].itemDetail.mainUnitName`, itemDetails.mainUnitName);

            let pricePerOptionsForItem = [{ value: 'main', label: itemDetails.mainUnitName || '' }];
            if (itemDetails.alternateUnitName && itemDetails.mainUnitName !== itemDetails.alternateUnitName) {
                setUseAltQty(true);
                pricePerOptionsForItem.push({ value: 'alt', label: itemDetails.alternateUnitName || '' });
            }
            setPricePerOptions(prevOptions => ({
                ...prevOptions,
                [index]: pricePerOptionsForItem
            }));

            if (voucherType == VoucherTypeEnum.ItemSale) {
                const matchingOption = pricePerOptionsForItem.find(option => option.label.includes(itemDetails.applySalesPriceOn as string));
                const pricePerValue = matchingOption ? matchingOption.value : 'main';
                setValue(`items[${index}].pricePer`, pricePerValue);
                setValue(`items[${index}].rate`, itemDetails.salePrice);
                setValue(`items[${index}].discountPercentage`, itemDetails.itemDiscountOnSalePercentage);
            }
            else if (voucherType == VoucherTypeEnum.ItemPurchase) {
                const matchingOption = pricePerOptionsForItem.find(option => option.label.includes(itemDetails.applyPurchasePriceOn as string));
                const pricePerValue = matchingOption ? matchingOption.value : 'main';
                setValue(`items[${index}].pricePer`, pricePerValue);
                setValue(`items[${index}].rate`, itemDetails.purchasePrice);
                setValue(`items[${index}].discountPercentage`, itemDetails.itemDiscountOnPurchasePercentage);

            }
        } catch (error) {
            console.error('Error fetching item details:', error);
            toast.error('Failed to fetch item details.');
            const fallbackPricePer = getValues(`items[${index}].itemDetail.mainUnitName`) || 'main';
            setValue(`items[${index}].pricePer`, fallbackPricePer);

        }
    };

    const calculateItemRow = (index: number, fieldName: string, value: string) => {
        if (fieldName != "pricePer") {
            setValue(`items[${index}].${fieldName}`, value);
        }

        setTimeout(() => {
            const item: ItemsInVoucherDto = getValues(`items[${index}]`);
            let pricePer = item.pricePer;
            if (fieldName == 'pricePer') {
                pricePer = value;
            }

            let { mainQty, altQty, rate, discountPercentage, discountAmount: enteredDiscountAmount, itemDetail } = item;
            const taxRate = itemDetail && itemDetail.gstSlab?.igst || 0;
            const conversion = itemDetail && itemDetail.conversion || 1;

            mainQty = parseFloat(mainQty.toString()) || 0;
            discountPercentage = parseFloat(discountPercentage.toString()) || 0;
            altQty = mainQty * conversion;
            const qty = pricePer === 'alt' ? altQty : mainQty;

            let rateValue = rate && parseFloat(rate.toString()) || 0;
            let basicAmount = qty * rateValue;
            let discountAmount = enteredDiscountAmount;

            if (fieldName === 'discountPercentage') {
                discountAmount = basicAmount * (parseFloat(discountPercentage.toString()) / 100);
                setValue(`items[${index}].discountAmount`, discountAmount.toFixed(2));
            } else if (fieldName === 'discountAmount') {
                const calculatedDiscountPercentage = (discountAmount / basicAmount) * 100;
                setValue(`items[${index}].discountPercentage`, calculatedDiscountPercentage.toFixed(2));
            }
            else if (discountPercentage > 0) {
                discountAmount = basicAmount * (parseFloat(discountPercentage.toString()) / 100);
                setValue(`items[${index}].discountAmount`, discountAmount.toFixed(2));
            }

            basicAmount -= discountAmount;
            basicAmount = parseFloat(basicAmount.toFixed(2));

            let iGST = 0, cGST = 0, sGST = 0;
            let taxAmount = 0, netAmount = 0;
            if (selectedTaxType === "Inclusive" && basicAmount > 0) {
                const amountBeforeTax = basicAmount / (1 + (taxRate / 100));
                taxAmount = basicAmount - amountBeforeTax;
                netAmount = basicAmount;
                basicAmount = amountBeforeTax;
            } else if (basicAmount > 0) {
                taxAmount = basicAmount * (taxRate / 100);
                netAmount = basicAmount + taxAmount;
            }

            if (isAccountOutOfState) {
                iGST = taxAmount;
            } else {
                cGST = sGST = taxAmount / 2;
                cGST = parseFloat(cGST.toFixed(2));
                sGST = parseFloat(sGST.toFixed(2));
            }
            netAmount = parseFloat((basicAmount + cGST + sGST + iGST).toFixed(2));

            setValue(`items[${index}].altQty`, altQty.toFixed(2));
            setValue(`items[${index}].basicAmount`, basicAmount.toFixed(2));
            setValue(`items[${index}].netAmount`, netAmount.toFixed(2));
            setValue(`items[${index}].iGST`, iGST.toFixed(2));
            setValue(`items[${index}].sGST`, sGST.toFixed(2));
            setValue(`items[${index}].cGST`, cGST.toFixed(2));
            setValue(`items[${index}].netAmount`, netAmount.toFixed(2));

            if (item.itemId && item.basicAmount > 0) {
                const items = getValues('items');
                if (index === items.length - 1) {
                    append(defaultItems);
                }
            }

        }, 0);

        setTimeout(() => {
            calculateBillSummary();
        }, 0);
    };

    const calculateBillSummary = () => {
        const items: ItemsInVoucherDto[] = watchedItems;

        let totalMainQty = 0;
        let totalAltQty = 0;
        let totalBasicAmount = 0;
        let totalDiscount = 0;
        let totalCGST = 0;
        let totalSGST = 0;
        let totalIGST = 0;
        let totalTax = 0;
        let netBillAmount = 0;

        items.forEach((item) => {
            totalMainQty += parseFloat(item.mainQty?.toString() || '0');
            totalAltQty += parseFloat(item.altQty?.toString() || '0');
            totalBasicAmount += parseFloat(item.basicAmount?.toString() || '0');
            totalDiscount += parseFloat(item.discountAmount?.toString() || '0');
            totalCGST += parseFloat(item.cGST?.toString() || '0');
            totalSGST += parseFloat(item.sGST?.toString() || '0');
            totalIGST += parseFloat(item.iGST?.toString() || '0');
            totalTax += parseFloat(item.cGST?.toString() || '0') + parseFloat(item.sGST?.toString() || '0') + parseFloat(item.iGST?.toString() || '0');
            netBillAmount += parseFloat(item.netAmount?.toString() || '0');
        });

        const roundedNetBillAmount = Math.round(netBillAmount);
        const totalRoundOff = parseFloat((netBillAmount - roundedNetBillAmount).toFixed(2));

        setBillSummary({
            totalMainQty,
            totalAltQty,
            totalBasicAmount,
            totalDiscount,
            totalCGST,
            totalSGST,
            totalIGST,
            totalTax,
            totalCharges: 0, // This needs to be defined or calculated similarly
            totalRoundOff,
            netBillAmount: roundedNetBillAmount,
        });
    };

    const onSubmit = async (data: FieldValues) => {
        try {
            if (voucherType == undefined) {
                toast.error("Invalid Voucher Type. Data cannot be saved.");
                return;
            }
            const finalData = convertFieldValuesToDto(data);
            console.log(finalData);

            if (voucherType == VoucherTypeEnum.ItemSale) {
                await agent.SalePurchase.saveVoucher(accessId, finalData, "");
                toast.success('Voucher created successfully');
                reset();
                setTransportDetails(defaultTransportDetails);
                setCustomerDetail(defaultCustomerDetails);
                setBillSummary(defaultBillSummary);
            }

        } catch (error) {
            console.error('Error in onSubmit:', error);
            handleApiErrors(error);
        }
    };

    const convertFieldValuesToDto = (data: FieldValues): ItemSalePurchaseVoucherDto => {
        if (!data.billBookId) {
            toast.error("Please select a bill book.");
            throw new Error("Bill book is required.");
        }
        if (!data.voucherDate) {
            toast.error("Please select a voucher date.");
            throw new Error("Voucher date is required.");
        }
        if (!data.paymentMode) {
            toast.error("Please select a payment mode.");
            throw new Error("Payment mode is required.");
        }

        if (!billSummary.netBillAmount) {
            toast.error("Net invoice value cannot be null.");
            throw new Error("Net invoice value is required.");
        }
        const processedItems = processItems(data.items);
        if (processedItems.length === 0) {
            toast.error("No items in the invoice. Data cannot be saved.");
            throw new Error("No items in the invoice.");
        }

        if (!data.accountId) {
            toast.error("Please select an account.");
            throw new Error("Account selection is required.");
        }

        const selectedAccount = allAccounts.find(acc => acc.accountID === data.accountId);
        if (!selectedAccount) {
            toast.error("Invalid account selection. Please select a valid account.");
            throw new Error("Invalid account selection.");
        }

        const itemSalePurchaseDto: ItemSalePurchaseVoucherDto = {
            voucherId: data.voucherId,
            voucherTypeId: voucherType,
            billBookId: data.billBookId,
            voucherDate: formatDateForBackend(data.voucherDate),
            paymentMode: data.paymentMode,
            accountId: selectedAccount.accountID,
            accountName: selectedAccount.accountName,
            voucherNoPrefix: data.voucherNoPrefix,
            voucherNo: data.voucherNo,
            remarks: data.remarks,
            netInvoiceValue: billSummary.netBillAmount,
            totalSGST: billSummary.totalSGST ?? 0,
            totalCGST: billSummary.totalCGST ?? 0,
            totalIGST: billSummary.totalIGST ?? 0,
            totalRoundOff: billSummary.totalRoundOff ?? 0,
            totalCharges: billSummary.totalCharges ?? 0,
            items: processedItems,
            transportDetailDto: transportDetails,
            customerDetailDto: customerDetail,
        };

        return itemSalePurchaseDto;
    }

    const processItems = (items: ItemsInVoucherDto[]): ItemsInVoucherDto[] => {
        const processedItems = items.map((item, index) => {
            let rateWithoutGST = item.rate || 0;
            let rateIncludingGST = item.rate || 0;
            const taxRate = item.itemDetail?.gstSlab?.igst;
            if (selectedTaxType === "Inclusive" && taxRate) {
                rateWithoutGST = rateIncludingGST / (1 + taxRate / 100);
            } else if (selectedTaxType === "Exclusive" && taxRate) {
                rateIncludingGST = rateWithoutGST * (1 + taxRate / 100);
            }
            const newItem = {
                itemId: item.itemId,
                salePurAccountID: item.itemDetail?.salePurAccountID,
                batchId: item.batchId,
                mainQty: item.mainQty || 0,
                altQty: item.altQty || 0,
                free: item.free || 0,
                rateWithoutGST: rateWithoutGST,
                rateIncludingGST: rateIncludingGST,
                pricePer: item.pricePer,
                basicAmount: item.basicAmount || 0,
                discountPercentage: item.discountPercentage || 0,
                discountAmount: item.discountAmount || 0,
                additionalDiscount: item.additionalDiscount || 0,
                sGST: item.sGST || 0,
                cGST: item.cGST || 0,
                iGST: item.iGST || 0,
                additionalTax1: item.additionalTax1 || 0,
                additionalTax2: item.additionalTax2 || 0,
                netAmount: item.netAmount || 0,
            };

            if ((item.itemId === 0 || item.itemId === null) && index !== items.length - 1) {
                throw new Error("All items must be selected. One item is missing, please recheck the invoice.");
            }

            return newItem;
        });

        // Remove the last row if it's empty (itemId is 0 and net value==0 or null)
        const lastItemIndex = processedItems.length - 1;
        if (processedItems.length > 0 && ((processedItems[lastItemIndex].itemId === 0 || processedItems[lastItemIndex].itemId === null) || (parseFloat(processedItems[lastItemIndex].netAmount.toString()) === 0 || processedItems[lastItemIndex].netAmount === null))) {
            processedItems.pop();
        }


        return processedItems;
    };

    return (
        <>
            <CommonCard header={voucherType == undefined ? "" : getVoucherTypeString(voucherType)} size="100%" showControlPanelButton >
                <FormNavigator onSubmit={handleSubmit(onSubmit)} isModalOpen={isInModal}>
                    <Row className="gx-2">
                        <Col xs={12} md={3} className="custom-col-billBook">
                            <CustomDropdown
                                name="billBookId"
                                label="Bill Book [F3-New]"
                                options={billBookList}
                                control={control}
                                onCreateButtonClick={() => { setShowBillBookModal(true); }}
                                onChangeCallback={handleBillBookChange}
                                badgeText={selectedTaxType}
                                dropDownWidth="400px"
                                hideDropdownIcon
                                hideClearIcon
                            />
                        </Col>
                        <Col xs={11} sm={5} md={2} className="custom-col-date">
                            <CustomDateInputBox
                                label="Date"
                                name="voucherDate"
                                validationRules={{ required: 'Date is required.' }}
                                register={register}
                                setValue={setValue}
                                error={errors.voucherDate}
                                financialYear={financialYear}
                                defaultDate={lastVoucherDate}

                            />
                        </Col>
                        <Col xs={11} sm={5} md={2} className="custom-col-reduced">
                            <CustomDropdown
                                name="paymentMode"
                                label="Payment Mode"
                                options={PAYMENT_MODE_OPTIONS}
                                control={control}
                                hideDropdownIcon
                                hideClearIcon
                            />
                        </Col>
                        <Col xs={12} sm={6} md={5}>
                            <CustomDropdown
                                label="Account Name"
                                name="accountId"
                                options={displayedAccounts.map(transformAccountToOption)}
                                control={control}
                                error={errors.accountId}
                                validationRules={{ required: 'Account Name is required.' }}
                                isCreatable
                                onCreateButtonClick={() => { setShowAccountModal(true); }}
                                dropDownWidth="800px"
                                onChangeCallback={handleAccountChange}
                                badgeText={partyGST}
                                hideDropdownIcon
                                hideClearIcon
                                disabled={askForCustomerDetailWhenCash && paymentMode.toLowerCase().includes("cash")}

                            />
                        </Col>
                        <Col xs={12} md={2} className="custom-col-reduced">
                            <CustomInput
                                label="Bill Number"
                                name="voucherNo"
                                register={register}
                                maxLength={12}
                                isTextCenter
                                autoFocus={focusBillNo}
                            />
                        </Col>
                    </Row>
                    <div className="scrollable-table-container" ref={scrollContainerRef}>
                        <Table bordered hover className="mt-2 custom-sale-table">
                            <thead className="custom-sale-thead">
                                <tr>
                                    <th style={{ width: '4%', textAlign: 'center' }}>SrNo</th>
                                    <th style={{ width: '20%', textAlign: 'center' }}>Item Name [F3-New]</th>
                                    <th style={{ width: '10%', textAlign: 'center' }}>Main Qty</th>

                                    {useAltQty && (
                                        <th style={{ width: '10%', textAlign: 'center' }}>Alt Qty</th>
                                    )}

                                    {useFree && (<th>Free</th>)}

                                    <th style={{ width: '10%', textAlign: 'center' }}>
                                        {selectedTaxType === 'Exclusive' ? 'Rate Without GST' : 'Rate With GST'}</th>

                                    {useAltQty && (
                                        <th style={{ width: '8%', textAlign: 'center' }}>Price Per</th>
                                    )}

                                    <th style={{ width: '10%', textAlign: 'center' }}>Basic Amount</th>
                                    <th style={{ width: '8%', textAlign: 'center' }}>Discount %</th>
                                    <th style={{ width: '10%', textAlign: 'center' }}>Discount Amt</th>

                                    {isAccountOutOfState == true ? (
                                        <th style={{ width: '10%', textAlign: 'center' }}>IGST</th>
                                    ) : (
                                        <>
                                            <th style={{ width: '10%', textAlign: 'center' }}>SGST</th>
                                            <th style={{ width: '10%', textAlign: 'center' }}>CGST</th>
                                        </>
                                    )}
                                    <th style={{ width: '10%', textAlign: 'center' }}>Amount</th>
                                    <th style={{ width: '3%', textAlign: 'center' }}></th>
                                </tr>
                            </thead>
                            <tbody>
                                {fields.map((field, index) => (
                                    <tr key={field.id}>
                                        <td style={{ textAlign: 'center' }}>{index + 1}</td>
                                        <td>
                                            <CustomDropdown
                                                name={`items[${index}].itemId`}
                                                options={itemDropDownList}
                                                control={control}
                                                isCreatable
                                                onCreateButtonClick={() => { setShowItemModal(true); }}
                                                dropDownWidth="800px"
                                                onChangeCallback={(selectedOption: OptionType | null) => {
                                                    if (selectedOption) {
                                                        setTimeout(() => fetchItemDetails(selectedOption.value, index), 0);
                                                    }
                                                }}
                                                hideDropdownIcon
                                                hideClearIcon
                                                isInTable
                                                onFocus={index === fields.length - 1 ? scrollToBottom : undefined}

                                            />
                                        </td>

                                        <td>
                                            <CustomInput
                                                name={`items[${index}].mainQty`}
                                                register={register}
                                                allowedChars="numericDecimal"
                                                onChange={(e) => calculateItemRow(index, 'mainQty', e.target.value)}

                                            />
                                        </td>
                                        {/* Alternate Qty */}
                                        {useAltQty && (
                                            <td>
                                                <CustomInput
                                                    name={`items[${index}].altQty`}
                                                    register={register}
                                                    allowedChars="numericDecimal"
                                                    onChange={(e) => calculateItemRow(index, 'altQty', e.target.value)}
                                                />
                                            </td>
                                        )}

                                        {useFree && (
                                            <td>
                                                <CustomInput
                                                    name={`items[${index}].free`}
                                                    register={register}
                                                    allowedChars="numericDecimal"
                                                />
                                            </td>
                                        )}

                                        <td>
                                            <CustomInput
                                                name={`items[${index}].rate`}
                                                register={register}
                                                allowedChars="numericDecimal"
                                                onChange={(e) => calculateItemRow(index, 'rate', e.target.value)}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'F3' && selectedTaxType === 'Exclusive') {
                                                        e.preventDefault();
                                                        setShowInclusiveRateInput(index);
                                                        setFocusInclusiveRateInput(`items[${index}].inclusiveRate`);
                                                    }
                                                }}
                                            />
                                            {showInclusiveRateInput === index && (
                                                <CustomInput
                                                    className="mt-2"
                                                    name={`items[${index}].inclusiveRate`}
                                                    register={register}
                                                    allowedChars="numericDecimal"
                                                    value={inclusiveRate}
                                                    onChange={(e) => setInclusiveRate(e.target.value)}
                                                    onBlur={() => {
                                                        const itemDetails = getValues(`items[${index}].itemDetail`) as ItemDetailDto;
                                                        const taxRate = parseFloat(itemDetails.gstSlab?.igst?.toString() || "0");
                                                        const inclusiveRateValue = parseFloat(inclusiveRate) || 0;
                                                        const exclusiveRate = inclusiveRateValue / (1 + taxRate / 100);
                                                        setValue(`items[${index}].rate`, exclusiveRate.toFixed(2));
                                                        calculateItemRow(index, 'rate', exclusiveRate.toFixed(2));
                                                        setShowInclusiveRateInput(null);
                                                        setInclusiveRate("");
                                                        setFocusInclusiveRateInput(null);
                                                    }}
                                                    autoFocus={focusInclusiveRateInput === `items[${index}].inclusiveRate`}
                                                />
                                            )}

                                        </td>
                                        {/* Price Per */}
                                        {useAltQty && (
                                            <td>
                                                <div data-skip-focus="true">
                                                    <CustomDropdown
                                                        name={`items[${index}].pricePer`}
                                                        control={control}
                                                        options={pricePerOptions[index] || []}
                                                        hideClearIcon={true}
                                                        hideDropdownIcon={true}
                                                        onChangeCallback={(selectedOption: OptionType | null) => {
                                                            if (selectedOption)
                                                                calculateItemRow(index, 'pricePer', selectedOption.value);
                                                        }}
                                                        dropDownWidth="100px"
                                                        isInTable
                                                    />
                                                </div>
                                            </td>
                                        )}
                                        <td>
                                            <CustomInput
                                                name={`items[${index}].basicAmount`}
                                                register={register}
                                                allowedChars="numericDecimal"
                                            />
                                        </td>
                                        <td>
                                            <CustomInput
                                                name={`items[${index}].discountPercentage`}
                                                register={register}
                                                allowedChars="numericDecimal"
                                                onChange={(e) => calculateItemRow(index, 'discountPercentage', e.target.value)}
                                                maxLength={2}
                                            />
                                        </td>
                                        <td>
                                            <CustomInput
                                                name={`items[${index}].discountAmount`}
                                                register={register}
                                                allowedChars="numericDecimal"
                                                onChange={(e) => calculateItemRow(index, 'discountAmount', e.target.value)}
                                            />
                                        </td>

                                        {isAccountOutOfState == true ? (
                                            <td>
                                                <CustomInput
                                                    name={`items[${index}].iGST`}
                                                    register={register}
                                                    allowedChars="numericDecimal"
                                                    disabled
                                                />
                                            </td>
                                        ) : (
                                            <>
                                                <td>
                                                    <CustomInput
                                                        name={`items[${index}].sGST`}
                                                        register={register}
                                                        allowedChars="numericDecimal"
                                                        disabled
                                                    />
                                                </td>
                                                <td>
                                                    <CustomInput
                                                        name={`items[${index}].cGST`}
                                                        register={register}
                                                        allowedChars="numericDecimal"
                                                        disabled
                                                    />
                                                </td>
                                            </>
                                        )}

                                        <td>
                                            <CustomInput
                                                name={`items[${index}].netAmount`}
                                                register={register}
                                                allowedChars="numericDecimal"
                                                disabled
                                            />
                                        </td>
                                        <td>
                                            <div data-skip-focus="true">
                                                <CustomButton text="X" variant="none" onClick={() => handleDeleteRow(index)} />
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    </div>
                    <div className="form-footer">
                        <div className="remarks-and-actions">
                            <Row>
                                <Col sm={12}>
                                    <CustomInput
                                        label="Remarks"
                                        name="remarks"
                                        register={register}
                                        autoFocus={focusRemarks}
                                    />
                                </Col>
                            </Row>
                            <Row className="mt-2 p-0 gx-1">
                                <Col><CustomButton size="sm" variant="outline-info" text="Transport Info (Ctrl+T)" className="w-100"
                                    onClick={() => {
                                        setShowTransportModal(true);
                                    }} /></Col>
                                <Col><CustomButton size="sm" variant="outline-info" text="Customer Detail (F2)" className="w-100"
                                    onClick={() => {
                                        setShowCustomerDetailModal(true);
                                    }} /></Col>
                                <Col><CustomButton size="sm" variant="outline-info" text="Charges/Discount (F2)" className="w-100" /></Col>
                                <Col><CustomButton size="sm" variant="success" type="submit" text="Save Invoice (Ctrl+S)" className="w-100" /></Col>
                                <Col><CustomButton size="sm" variant="outline-danger" text="Final Delete (Ctrl+D)" className="w-100" /></Col>
                                <Col><CustomButton size="sm" variant="success" text="Print Invoice (Ctrl+P)" className="w-100" /></Col>
                            </Row>
                        </div>

                        <div className="bill-summary">
                            <Table>
                                <tbody>
                                    <tr>
                                        <td >Main Qty</td>
                                        <td className="text-end">{(billSummary.totalMainQty)}</td>
                                        <td >SGST</td>
                                        <td className="text-end">{billSummary.totalSGST.toFixed(2)}</td>
                                    </tr>
                                    <tr>
                                        <td >Alt Qty</td>
                                        <td className="text-end">{billSummary.totalAltQty.toFixed(2)}</td>
                                        <td >CGST</td>
                                        <td className="text-end">{billSummary.totalCGST.toFixed(2)}</td>
                                    </tr>
                                    <tr>
                                        <td >Basic Amt</td>
                                        <td className="text-end">{billSummary.totalBasicAmount.toFixed(2)}</td>
                                        <td >IGST</td>
                                        <td className="text-end">{billSummary.totalIGST.toFixed(2)}</td>
                                    </tr>
                                    <tr>
                                        <td >Discount</td>
                                        <td className="text-end">{billSummary.totalDiscount.toFixed(2)}</td>
                                        <td >Total Tax</td>
                                        <td className="text-end">{billSummary.totalTax.toFixed(2)}</td>
                                    </tr>
                                    <tr>
                                        <td ></td>
                                        <td></td>
                                        <td >Charges</td>
                                        <td className="text-end">{billSummary.totalCharges.toFixed(2)}</td>
                                    </tr>
                                    <tr>
                                        <td ></td>
                                        <td></td>
                                        <td >Round Off</td>
                                        <td className="text-end">{billSummary.totalRoundOff.toFixed(2)}</td>
                                    </tr>

                                    <tr>
                                        <td colSpan={2}>Bill Amount (Rs.):</td>
                                        <td className="fw-bold" colSpan={2} style={{ textAlign: 'end', fontSize: '1.25rem' }}>{formatNumberIST(billSummary.netBillAmount)}</td>
                                    </tr>
                                </tbody>
                            </Table>
                        </div>
                    </div>

                </FormNavigator >
            </CommonCard >
            <CommonModal show={showBillBookModal} onHide={() => { setShowBillBookModal(false); }} size='xl'>
                <Suspense fallback={<div>Loading...</div>}>
                    <SaleBillBookForm onSaveSuccess={() => { loadBillBookOptions(); setShowBillBookModal(false); }} isModalOpen={showBillBookModal} />
                </Suspense>
            </CommonModal>
            <CommonModal show={showAccountModal} onHide={() => { setShowAccountModal(false); }} size='xl'>
                <Suspense fallback={<div>Loading...</div>}>
                    <AccountForm
                        isModalOpen={showAccountModal}
                        onCloseModalAfterSave={() => {
                            fetchAccounts(voucherDate);
                            setShowAccountModal(false);
                        }}
                    />
                </Suspense>
            </CommonModal>

            <CommonModal show={showItemModal} onHide={() => { setShowItemModal(false); }} size='xl'>
                <Suspense fallback={<div>Loading...</div>}>
                    <ItemForm
                        isModalOpen={showItemModal}
                        onCloseModalAfterSave={async () => {
                            if (financialYear?.financialYearFrom) {
                                const options = await fetchItemListForDropdown(accessId, financialYear?.financialYearFrom, voucherDate);
                                setItemDropDownList(options);
                            }
                            setShowItemModal(false);
                        }}
                    />
                </Suspense>
            </CommonModal>

            {showTransportModal &&
                <TransportAndShippingDetailModal
                    show={showTransportModal}

                    onHide={() => {
                        setShowTransportModal(false)
                        setTimeout(() => {
                            setFocusRemarks(true);
                        }, 10);
                    }}
                    onSave={updateParentStateOfTransportDetails}
                    initialData={transportDetails}
                />
            }
            {showCustomerDetailModal &&
                <CustomerDetailModal
                    show={showCustomerDetailModal}
                    onHide={() => {
                        setShowCustomerDetailModal(false);
                        setTimeout(() => {
                            setFocusBillNo(true);
                        }, 10);
                    }}
                    onSave={updateParentStateOfCustomerDetail}
                    initialData={customerDetail}
                />
            }

        </>
    )

}