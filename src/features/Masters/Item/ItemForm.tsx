import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { CommonCard, CustomButton, CustomDropdown, CustomInput, FormNavigator } from "../../../app/components/Components";
import { Col, Row } from "react-bootstrap";
import { useGstSlabs } from "../../../app/hooks/useGSTSlabsOptions";
import agent from "../../../app/api/agent";
import { OptionType } from "../../../app/models/optionType";
import ItemUnitDto from "../ItemUnit/itemUnitDto";
import { useHSNCodesOrSAC } from "../../../app/hooks/indexOptionsHooks";
import { convertNullOrEmptyToZero, convertEmptyStringToNullForIDs } from "../../../app/utils/numberUtils";
import toast from "react-hot-toast";
import handleApiErrors from "../../../app/errors/handleApiErrors";
import { getAccessIdOrRedirect } from "../Company/CompanyInformation";
import useDebounce from "../../../app/utils/useDebounce";
import { ItemFormDto } from "./ItemDto";

interface ItemFormProps {
    isModalOpen?: boolean;
    onCloseModalAfterSave?: () => void;
    itemID?: number;
}
function ItemForm({ isModalOpen = false, onCloseModalAfterSave, itemID }: ItemFormProps) {
    const accessId = getAccessIdOrRedirect();

    const {
        register, handleSubmit, setValue, watch, control,
        formState: { errors, isSubmitting }, reset
    } = useForm<ItemFormDto>({ mode: "all" });

    const gstSlabs = useGstSlabs(accessId);
    const [isLoadingSalePurchaseAccounts, setIsLoadingSalePurchaseAccounts] = useState(false);
    const [salePurchaseAccounts, setSalePurchaseAccounts] = useState<OptionType[]>([]);
    const [itemUnits, setItemUnits] = useState<OptionType[]>([]);
    const [itemCategories, setItemCategories] = useState<OptionType[]>([]);
    const [itemCompany, setItemCompany] = useState<OptionType[]>([]);
    const [itemGodown, setItemGodown] = useState<OptionType[]>([]);
    const [hsnCodeInput, setHsnCodeInput] = useState('');
    const [hsnCodes, setHsnCodes] = useState<OptionType[]>([]);
    const debouncedHSNCodeInput = useDebounce(hsnCodeInput, 700);
    const [dataLoaded, setDataLoaded] = useState(false);


    //Load Units
    const loadUnits = async () => {
        try {
            const response = await agent.ItemUnit.getAllItemUnits(accessId);
            const formattedOptions = response.map((itemUnit: ItemUnitDto) => ({
                label: itemUnit.unitName,
                value: itemUnit.itemUnitID,
            }));
            setItemUnits(formattedOptions);
        } catch (error) {
            console.error("Error fetching item units", error);
        }
    };
    //Load Item Categories
    const loadItemCategories = async () => {
        try {
            const response = await agent.ItemCategory.getAllItemCategories(accessId);
            const formattedOptions = response.map((itemCategory: ItemCategoryDto) => ({
                label: itemCategory.itemCategoryName,
                value: itemCategory.itemCategoryID,
            }));
            setItemCategories(formattedOptions);
        } catch (error) {
            console.error("Error fetching item categories", error);
        }
    };


    //Load Item Company
    const loadItemCompany = async () => {
        try {
            const response = await agent.ItemCompany.getAllItemCompanies(accessId);
            const formattedOptions = response.map((itemCompany: ItemCompanyDto) => ({
                label: itemCompany.itemCompanyName,
                value: itemCompany.itemCompanyID,
            }));
            setItemCompany(formattedOptions);
        } catch (error) {
            console.error("Error fetching item company:", error);
        }
    };
    //Load Item Godown
    const loadItemGodown = async () => {
        try {
            const response = await agent.ItemGodown.getAllItemGodowns(accessId);
            const formattedOptions = response.map((itemGodown: ItemGodownDto) => ({
                label: itemGodown.itemGodownName,
                value: itemGodown.itemGodownID,
            }));
            setItemGodown(formattedOptions);
        } catch (error) {
            console.error("Error fetching item Godown:", error);
        }
    };
    useEffect(() => {
        const loadData = async () => {
            await Promise.all([
                loadUnits(),
                loadItemCategories(),
                loadItemCompany(),
                loadItemGodown(),
            ]);
            setDataLoaded(true);
        };

        loadData();
    }, [accessId]);



    useEffect(() => {
        const fetchHSNCodes = async () => {
            if (debouncedHSNCodeInput && debouncedHSNCodeInput.length >= 3) {
                try {
                    const codes = await useHSNCodesOrSAC(accessId, debouncedHSNCodeInput);
                    setHsnCodes(codes);

                } catch (error) {
                    console.error('Failed to fetch HSN codes:', error);
                    setHsnCodes([]);
                }
            } else {
                setHsnCodes([]);
            }
        };

        fetchHSNCodes();
    }, [debouncedHSNCodeInput]);


    // Watching form fields
    const selectedGstSlabId = watch("gstSlabID");
    const useAlternateUnit = watch("useAlternateUnit");
    const mainUnitID = watch("mainUnitID");
    const alternateUnitID = watch("alternateUnitID");

    const mainUnit = itemUnits.find(unit => unit.value === mainUnitID)?.label || '';
    const alternateUnit = itemUnits.find(unit => unit.value === alternateUnitID)?.label || '';
    const alternateUnitOptions = itemUnits.filter(unit => unit.value !== mainUnitID);
    const [applyPurchasePriceOptions, setApplyPurchasePriceOptions] = useState<OptionType[]>([]);
    const [applySalesPriceOptions, setApplySalesPriceOptions] = useState<OptionType[]>([]);


    function setupPriceApplicationOptions() {
        const mainUnitOption = itemUnits.find(unit => unit.value === mainUnitID) || null;
        const alternateUnitOption = itemUnits.find(unit => unit.value === alternateUnitID) || null;

        // Define options array including both units
        const priceApplicationOptions = [];
        if (mainUnitOption) {
            priceApplicationOptions.push({ value: mainUnitOption.value, label: mainUnitOption.label });
        }
        if (alternateUnitOption) {
            priceApplicationOptions.push({ value: alternateUnitOption.value, label: alternateUnitOption.label });
        }

        // Set values for purchase and sales price application
        setValue("applyPurchasePriceOn", mainUnitOption ? mainUnitOption.value : '', { shouldDirty: true });
        setValue("applySalesPriceOn", alternateUnitOption ? alternateUnitOption.value : '', { shouldDirty: true });

        // Assuming you have state hooks to store these options for dropdowns
        setApplyPurchasePriceOptions(priceApplicationOptions);
        setApplySalesPriceOptions(priceApplicationOptions);
    }
    useEffect(() => {
        setupPriceApplicationOptions();
    }, [itemUnits, useAlternateUnit, mainUnitID, alternateUnitID, itemID]);


    useEffect(() => {
        if (selectedGstSlabId) {
            setIsLoadingSalePurchaseAccounts(true);
            agent.Account.getAccountsByGSTSlabId(accessId, selectedGstSlabId)
                .then((accounts) => {
                    const options = accounts.map(account => ({
                        value: account.accountID.toString(),
                        label: account.accountName,
                    }));
                    setSalePurchaseAccounts(options);
                })
                .catch(error => {
                    console.error("Error fetching Sale Purchase accounts:", error);
                })
                .finally(() => {
                    setIsLoadingSalePurchaseAccounts(false); // Stop loading
                });
        } else {
            setSalePurchaseAccounts([]);
        }
    }, [selectedGstSlabId, accessId]);

    const onSubmit = async (data: ItemFormDto) => {
        try {
            const mainUnitLabel = itemUnits.find(unit => unit.value === data.mainUnitID)?.label || '';
            data.applyPurchasePriceOn = data.applyPurchasePriceOn ? itemUnits.find(unit => unit.value === data.applyPurchasePriceOn)?.label : mainUnitLabel;
            data.applySalesPriceOn = data.applySalesPriceOn ? itemUnits.find(unit => unit.value === data.applySalesPriceOn)?.label : mainUnitLabel;
            data.hsnCode = data.hsnCode && data.hsnCode.toString()?.split(' - ')[0];
            const numericFields: (keyof ItemFormDto)[] = ['mainOpeningStockQty', 'mainOpeningAmount', 'alternateOpeningStockQty', 'alternateOpeningAmount', 'conversion', 'purchasePrice', 'salePrice', 'itemDiscountOnPurchasePercentage', 'itemDiscountOnSalePercentage'];
            const processedData = convertNullOrEmptyToZero(data, numericFields);
            const fieldsToProcessForNull: (keyof ItemFormDto)[] = ["itemCategoryID", "itemCompanyID", "itemGodownID"];
            const finalProcessedData = convertEmptyStringToNullForIDs(processedData, fieldsToProcessForNull);
            if (itemID) {
                await agent.Item.updateItem(accessId, itemID, finalProcessedData);
                toast.success('Item updated successfully');
            } else {
                await agent.Item.createItem(accessId, finalProcessedData);
                toast.success('Item added successfully');
            }
            if (onCloseModalAfterSave && isModalOpen) {
                onCloseModalAfterSave();
            }
            reset();
        } catch (error) {
            console.error('Error in onSubmit:', error);
            handleApiErrors(error);
        }
    };
    // Get existing item data if you came from Item list and edit the Item
    useEffect(() => {
        const fetchItemDetails = async () => {
            if (dataLoaded && itemID) {
                try {
                    const item = await agent.Item.getItemById(accessId, itemID);
                    reset(item);

                    if (item.alternateUnitID != item.mainUnitID && item.alternateUnitID) {
                        setValue("useAlternateUnit", "Y");
                        const purchasePriceOn = applyPurchasePriceOptions.find(option => option.value == item?.applyPurchasePriceOn);
                        setValue("applyPurchasePriceOn", purchasePriceOn?.value);
                        const salesPriceOn = applySalesPriceOptions.find(option => option.value == item?.applySalesPriceOn);
                        setValue("applySalesPriceOn", salesPriceOn?.value);
                    }
                    item.hsnCode && setHsnCodeInput(item?.hsnCode);

                } catch (error) {
                    console.error("Failed to fetch Item details", error);
                }
            }
        }
        fetchItemDetails();
    }, [dataLoaded, itemID]);

    return (
        <CommonCard header="Create New Item" size="100%">
            <FormNavigator onSubmit={handleSubmit(onSubmit)} isModalOpen={isModalOpen}>
                <Row>
                    <Col xs={12}>
                        <CustomInput
                            label="Item Name"
                            name="itemName"
                            register={register}
                            validationRules={{ required: 'Item Name is required.' }}
                            maxLength={300}
                            error={errors.itemName}
                        />
                    </Col>
                    <Col xs={12} md={4}>
                        <CustomDropdown
                            label="GST Slab"
                            name="gstSlabID"
                            options={gstSlabs}
                            control={control}
                            validationRules={{ required: 'GST Slab is required.' }}
                            error={errors.gstSlabID}
                        />
                    </Col>
                    <Col xs={12} md={4}>
                        <CustomDropdown
                            label="Sale Purchase Account"
                            name="salePurAccountID"
                            options={salePurchaseAccounts}
                            control={control}
                            error={errors.salePurAccountID}
                            isLoading={isLoadingSalePurchaseAccounts}
                            validationRules={{ required: 'Sale Purchase Account is required.' }}
                        />
                    </Col>
                    <Col md={4}>
                        <CustomDropdown
                            label="HSN/SAC Code"
                            name="hsnCode"
                            control={control}
                            placeholder="Enter First 3 digits of HSN Code"
                            options={hsnCodes}
                            onInputChange={(newValue) => setHsnCodeInput(newValue)}

                        />
                    </Col>
                </Row>
                <Row>
                    <Col xs={12} md={4}>
                        <CustomDropdown
                            label="Category"
                            name="itemCategoryID"
                            control={control}
                            options={itemCategories}
                        />
                    </Col>
                    <Col xs={12} md={4}>
                        <CustomDropdown
                            label="Company/Brand"
                            name="itemCompanyID"
                            control={control}
                            options={itemCompany}
                        />
                    </Col>
                    <Col xs={12} md={4}>
                        <CustomDropdown
                            label="Godown/Store"
                            name="itemGodownID"
                            control={control}
                            options={itemGodown}
                        />
                    </Col>
                </Row>
                <Row>
                    <Col xs={12} md={2}>
                        <CustomDropdown
                            label="Main Unit"
                            name="mainUnitID"
                            control={control}
                            options={itemUnits}
                        />
                    </Col>
                    <Col xs={12} md={2}>
                        <CustomDropdown
                            label="Use Alternate Unit"
                            name="useAlternateUnit"
                            control={control}
                            options={[]}
                            YesNo

                        />
                    </Col>
                    <Col xs={12} md={2}>
                        <CustomInput
                            label={`${mainUnit} Op. Stock (Qty)`}
                            name="mainOpeningStockQty"
                            allowedChars="numericDecimal"
                            register={register}
                        />
                    </Col>
                    <Col xs={12} md={2}>
                        <CustomInput
                            label={`${mainUnit} Op. Stock (Value)`}
                            name="mainOpeningAmount"
                            allowedChars="numericDecimal"
                            register={register}
                        />
                    </Col>


                </Row>

                {/* Show this row only when use Alternate is Yes */}
                {useAlternateUnit === 'Y' && (
                    <Row>
                        <Col xs={12} md={2}>
                            <CustomDropdown
                                label="Alternate Unit"
                                name="alternateUnitID"
                                control={control}
                                options={alternateUnitOptions}
                            />
                        </Col>
                        <Col xs={12} md={2}>
                            <CustomInput
                                label={`${alternateUnit} Op. Stock (Qty)`}
                                name="alternateOpeningStockQty"
                                allowedChars="numericDecimal"
                                register={register}
                            />
                        </Col>
                        <Col xs={12} md={2}>
                            <CustomInput
                                label={`${alternateUnit} Op. Stock (Value)`}
                                name="alternateOpeningAmount"
                                allowedChars="numericDecimal"
                                register={register}
                            />
                        </Col>
                        <Col xs={12} md={2}>
                            <CustomInput
                                label="Conversion"
                                name="conversion"
                                allowedChars="numericDecimal"
                                register={register}
                                defaultValue="1"
                            />
                        </Col>
                        <Col xs={12} md={2}>
                            <CustomDropdown
                                label="Pur. Price Apply On"
                                name="applyPurchasePriceOn"
                                control={control}
                                options={applyPurchasePriceOptions}

                            />
                        </Col>
                        <Col xs={12} md={2}>
                            <CustomDropdown
                                label="Sales Price Apply On"
                                name="applySalesPriceOn"
                                control={control}
                                options={applySalesPriceOptions}

                            />
                        </Col>
                    </Row>
                )}
                <Row>
                    <Col xs={6} md={2}>
                        <CustomInput
                            label="Default Pur. Price"
                            name="purchasePrice"
                            allowedChars="numericDecimal"
                            register={register}

                        />
                    </Col>
                    <Col xs={6} md={2}>
                        <CustomInput
                            label="Default Sale Price"
                            name="salePrice"
                            allowedChars="numericDecimal"
                            register={register}
                        />
                    </Col>
                    <Col xs={6} md={2}>
                        <CustomInput
                            label="Discount % On Pur."
                            name="itemDiscountOnPurchasePercentage"
                            allowedChars="numericDecimal"
                            register={register}
                        />
                    </Col>
                    <Col xs={6} md={2}>
                        <CustomInput
                            label="Discount % On Sale"
                            name="itemDiscountOnSalePercentage"
                            allowedChars="numericDecimal"
                            register={register}
                        />
                    </Col>
                    <Col xs={12} md={2}>
                        <CustomDropdown
                            label="Use Batch No"
                            name="useBatchNo"
                            control={control}
                            options={[]}
                            YesNo
                        />
                    </Col>
                    <Row>
                        <Col xs={12} className="d-flex align-items-end justify-content-end mb-2">
                            <CustomButton text={itemID ? 'Update' : 'Save'} variant="primary" type="submit" isSubmitting={isSubmitting} />
                        </Col>
                    </Row>
                </Row>
            </FormNavigator>
        </CommonCard>
    );
}
export default ItemForm;
