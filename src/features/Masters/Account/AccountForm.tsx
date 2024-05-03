import { Suspense, useEffect, useState } from "react";
import agent from "../../../app/api/agent";
import { useAppSelector } from "../../../app/store/configureStore";
import toast from "react-hot-toast";
import handleApiErrors from "../../../app/errors/handleApiErrors";
import { Col, Row } from "react-bootstrap";
import { CommonCard, CustomButton, CustomInput, FormNavigator, CustomDropdown } from "../../../app/components/Components";
import { AccountDto, getDefaultFormData, } from "./accountDto";
import { OptionType } from '../../../app/models/optionType'
import { useAccountGroups, useDebitCreditOptions, useGstSlabs, useStates } from "../../../app/hooks/indexOptionsHooks";
import { CapitalAccountFields, DefaultFields, FarmerFields, FixedAssetFields, TradingAccountFields } from "./indexAccountFormFields";
import CityDto from "../City/cityDto";
import { convertEmptyStringToNullForIDs, convertNullOrEmptyToZero } from "../../../app/utils/numberUtils";
import { useForm } from "react-hook-form";
import CommonModal from "../../../app/components/CommonModal";
import AccountGroupForm from "../AccountGroup/AccountGroupForm";
import { selectCurrentFinancialYear } from "../FinancialYear/financialYearSlice";
import { getAccessIdOrRedirect } from "../Company/CompanyInformation";
import { extractPANFromGSTIN, extractStateCodeFromGSTIN } from "../../../app/validations/commonValidations";

const PARTY_TYPES_OPTIONS = [
    { label: "Composition", value: "Composition" },
    { label: "GST Party", value: "GST Party" },
    { label: "GST Party Out of State", value: "GST Party Out of State" },
    { label: "Un-Registered", value: "Un-Registered" },
    { label: "Un-Registered Out of State", value: "Un-Registered Out of State" },
    { label: "Out of Country (GST Not Applicable)", value: "Out of Country (GST Not Applicable)" },
    { label: "Out of Country (GST Applicable)", value: "Out of Country (GST Applicable)" },
];
const MEASUREMENTS_OPTIONS = [
    { label: "N.A", value: "N.A" },
    { label: "Unit", value: "Unit" },
    { label: "Weight", value: "Weight" },
    { label: "Unit and Weight", value: "Unit and Weight" },
    { label: "Unit and Rate", value: "Unit and Rate" },
    { label: "Weight and Rate", value: "Weight and Rate" },
    { label: "Unit, Weight and Rate", value: "Unit, Weight and Rate" }
];

interface AccountFormProps {
    isModalOpen?: boolean;
    onCloseModalAfterSave?: () => void;
    accountId?: string;
}

function AccountForm({ isModalOpen = false, accountId, onCloseModalAfterSave }: AccountFormProps) {
    const accessId = getAccessIdOrRedirect();
    const financialYear = useAppSelector(selectCurrentFinancialYear);

    const { register, handleSubmit, setValue, watch, control, formState: { errors, isSubmitting }, reset } = useForm<AccountDto>({
        mode: "all",
    });

    const [selectedAccountGroup, setSelectedAccountGroup] = useState<string>('');
    const [cityOptions, setCityOptions] = useState<OptionType[]>([]);
    const debitCreditOptions = useDebitCreditOptions();
    const accountGroupOptions = useAccountGroups(accessId);
    const stateOptions = useStates();
    const gstSlabs = useGstSlabs(accessId);
    const [modalShow, setModalShow] = useState(false);
    const gstin = watch('gstNo');

    // Load cites
    useEffect(() => {
        const loadCities = async () => {
            try {
                const response = await agent.City.getAllCities(accessId);
                const formattedOptions = response.map((city: CityDto) => ({
                    label: `${city.cityName} | ${city.pincode}`,
                    value: city.cityID,
                }));
                setCityOptions(formattedOptions);
            } catch (error) {
                console.error("Error fetching cities:", error);
            }
        };
        loadCities();
    }, [accessId]);

    //Set Dr and CR
    useEffect(() => {
        //No change when in edit mode
        if (!accountId && selectedAccountGroup != null) {
            if (selectedAccountGroup.toLowerCase().includes('liabilities' || 'capital' || 'creditors' || 'loans' || 'payable' || ''))
                setValue("debitCredit", 'Credit');
            else
                setValue("debitCredit", 'Debit');
        }
    }, [selectedAccountGroup])

    useEffect(() => {
        if (gstin) {
            const extractedPan = extractPANFromGSTIN(gstin);
            extractedPan && setValue("panNo", extractedPan);
            const stateCode = extractStateCodeFromGSTIN(gstin);
            const matchingState = stateCode && stateOptions.find(option => option.label.includes(stateCode));
            matchingState && setValue("stateId", matchingState.value);
        }
    }, [gstin]);

    const handleAccountGroupChange = (selectedOption: OptionType | null) => {
        selectedOption && setSelectedAccountGroup(selectedOption.label);
    };

    const renderGroupSpecificFields = () => {
        const lowerCaseGroup = typeof selectedAccountGroup === 'string' ? selectedAccountGroup.toLowerCase() : '';
        if (lowerCaseGroup.includes('bank account') || lowerCaseGroup.includes('secured loans') || lowerCaseGroup.includes('expenses')) {
            return <></>;
        } else if (lowerCaseGroup.includes('trading account')) {
            return <TradingAccountFields register={register} errors={errors} control={control} measurementsOptions={MEASUREMENTS_OPTIONS} gstSlabs={gstSlabs} accessId={accessId} />;
        } else if (lowerCaseGroup.includes('fixed asset')) {
            return <FixedAssetFields register={register} errors={errors} />;
        } else if (lowerCaseGroup.includes('capital account')) {
            return <CapitalAccountFields register={register} errors={errors} />;
        } else if (lowerCaseGroup.includes('farmer')) {
            return <FarmerFields register={register} errors={errors} />;
        } else {
            return <DefaultFields register={register} errors={errors} control={control} measurementsOptions={MEASUREMENTS_OPTIONS} cityOptions={cityOptions} stateOptions={stateOptions} partyTypesOptions={PARTY_TYPES_OPTIONS} accessId={accessId} />;
        }
    };
    const onSubmit = async (data: AccountDto) => {
        try {
            if (!accessId || !financialYear) return;

            if (data.partyType) {
                if ((data.partyType.includes("GST Party") || data.partyType.includes("Composition")) && (!data.gstNo || data.gstNo.length != 15)) {
                    toast.error("Please enter GSTNo. or change the party type if no GSTNo.");
                    return;
                }
            }

            data.accountGroupName = selectedAccountGroup;
            data.hsnCode = data.hsnCode && data.hsnCode.toString()?.split(' - ')[0];
            const financialYearFrom = financialYear?.financialYearFrom.toString();
            const defaultAccountData = getDefaultFormData();
            const finalData = { ...defaultAccountData, ...data };

            if (!finalData.stateId) {
                const companyState = stateOptions.find(option => option.label.includes(data.companyState));
                finalData.companyState = companyState && companyState?.value;
            }

            const numericFields: (keyof AccountDto)[] = ['openingBalance', 'opUnit', 'opWeight', 'opRate', 'grossProfit', 'cessPer', 'capitalSalary', 'lastYearGrossProfitPercentage', 'marginPercentage', 'discountPercentage'];
            const processedData = convertNullOrEmptyToZero(finalData, numericFields);
            const fieldsToProcessForNull: (keyof AccountDto)[] = ["cityId", "stateId", "gstSlabId", "itemUnitId", "emailId"];
            const finalProcessedData = convertEmptyStringToNullForIDs(processedData, fieldsToProcessForNull);

            if (accountId) {
                await agent.Account.updateAccount(accessId, accountId, financialYearFrom, finalProcessedData);
                toast.success('Account updated successfully');
            } else {
                await agent.Account.createAccount(accessId, financialYearFrom, finalProcessedData);
                toast.success('Account added successfully');
            }
            if (onCloseModalAfterSave) {
                onCloseModalAfterSave();
                return;
            }
            reset();

        } catch (error) {
            console.error('Error in onSubmit:', error);
            handleApiErrors(error);
        }
    };

    // Get existing account data if you came from Account list and edit the account
    useEffect(() => {
        const fetchAccountDetails = async () => {
            if (!accountId) {
                return;
            }
            if (accountId && accountGroupOptions.length > 0) {
                try {
                    const accountDetails = await agent.Account.getAccountById(accessId, accountId);
                    reset(accountDetails);
                    const selectedAccountGroupOption = accountGroupOptions.find(option => option.value === accountDetails.accountGroupID);
                    selectedAccountGroupOption && setSelectedAccountGroup(selectedAccountGroupOption?.label);
                    selectedAccountGroupOption && setValue('accountGroupID', selectedAccountGroupOption.value);
                    const selectStateOption = stateOptions.find(option => option.value === accountDetails.stateId?.toString());
                    selectStateOption && setValue('stateId', selectStateOption.value);
                    const measurementsOptions = MEASUREMENTS_OPTIONS.find(option => option.value.includes(accountDetails?.measurement as string));
                    setValue('measurement', measurementsOptions?.value);

                } catch (error) {
                    console.error("Failed to fetch account details", error);
                }
            };
        }
        fetchAccountDetails();
    }, [accountId, accountGroupOptions]);
    return (
        <>
            <CommonCard header='Create New Account' size="100%">
                <FormNavigator onSubmit={handleSubmit(onSubmit)} isModalOpen={isModalOpen}>
                    <Row>
                        <Col xs={12}>
                            <CustomInput
                                label="Account Name"
                                name="accountName"
                                register={register}
                                validationRules={{ required: 'Account Name is required.' }}
                                maxLength={300}
                                error={errors.accountName}
                            />
                        </Col>
                    </Row>
                    <Row>
                        <Col md={6} sm={12}>
                            <CustomDropdown
                                name="accountGroupID"
                                label="Account Group"
                                options={accountGroupOptions}
                                control={control}
                                error={errors.accountGroupID}
                                validationRules={{ required: 'Account Group is required.' }}
                                onChangeCallback={handleAccountGroupChange}
                                isCreatable={true}
                                showCreateButton={true}
                                onCreateButtonClick={() => { setModalShow(true); }}
                            />
                        </Col>
                        {/* {!shouldHideOpBalAndDrCr && ( */}
                        <>
                            <Col md={3}>
                                <CustomInput
                                    label="Opening Balance"
                                    name="openingBalance"
                                    register={register}
                                    allowedChars="numericDecimal"
                                />
                            </Col>
                            <Col md={3}>
                                <CustomDropdown
                                    label="Debit/Credit"
                                    name="debitCredit"
                                    options={debitCreditOptions}
                                    control={control}
                                    error={errors.debitCredit}
                                    validationRules={{ required: "Debit or Credit is required" }}
                                />
                            </Col>
                        </>
                        {/* )} */}
                    </Row>
                    {renderGroupSpecificFields()}
                    <Row>
                        <Col xs={12} className="d-flex align-items-end justify-content-end mb-2">
                            <CustomButton text={accountId ? 'Update' : 'Save'} variant="primary" type="submit" isSubmitting={isSubmitting} />
                        </Col>
                    </Row>
                </FormNavigator>
            </CommonCard>

            <CommonModal show={modalShow} onHide={() => setModalShow(false)}>
                <Suspense fallback={<div>Loading...</div>}>
                    <AccountGroupForm />
                </Suspense>
            </CommonModal>
        </>
    );
}
export default AccountForm;
