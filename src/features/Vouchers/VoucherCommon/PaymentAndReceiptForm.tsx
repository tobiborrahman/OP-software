
import { CommonCard, CommonTable, CustomButton, CustomDateInputBox, CustomDropdown, CustomInput, FormNavigator, CommonModal } from '../../../app/components/Components';
import { Suspense, useEffect, useRef, useState } from 'react';
import { useAppSelector } from '../../../app/store/configureStore';
import { convertNullOrEmptyToZero, formatNumberIST } from '../../../app/utils/numberUtils';
import agent from '../../../app/api/agent';
import toast from 'react-hot-toast';
import handleApiErrors from '../../../app/errors/handleApiErrors';
import { Col, Row } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { VoucherTypeEnum, getVoucherTypeString } from './voucherTypeEnum';
import { PaymentAndReceiptDto } from '../PaymentAndReceipt/paymentAndReceiptDto';
import { selectCurrentFinancialYear } from '../../Masters/FinancialYear/financialYearSlice';
import { OptionType } from '../../../app/models/optionType';
import AccountForm from '../../Masters/Account/AccountForm';
import ControlPanelForm from './ControlPanelForm';
import { ControlOptionDto } from './controlOptionDto';
import { ColumnDef } from '@tanstack/react-table';
import { formatDateForBackend, formatDateForFrontend, validateDate } from '../../../app/utils/dateUtils';
import { transformAccountToOption } from '../../../app/utils/accountUtils';
import getLastVoucherDate from '../../../app/hooks/useLastVoucherDate';
import { getAccessIdOrRedirect } from '../../Masters/Company/CompanyInformation';

const columns: ColumnDef<PaymentAndReceiptDto>[] = [
    {
        accessorFn: row => formatDateForFrontend(row.voucherDate),
        id: 'voucherDate',
        header: 'Date',
        cell: info => info.getValue(),
    },
    {
        accessorFn: row => row.receiptNumber,
        id: 'receiptNumber',
        header: 'Receipt No.',
        cell: info => info.getValue(),
    },
    {
        accessorFn: row => row.accountName,
        id: 'accountName',
        header: 'Account Name',
        cell: info => info.getValue(),
    },
    {
        accessorFn: row => row.remarks,
        id: 'remarks',
        header: 'Remarks',
        cell: info => info.getValue(),
    },
    {
        accessorFn: row => formatNumberIST(row.basicAmount),
        id: 'basicAmount',
        header: 'Total Amount',
        cell: info => info.getValue(),
    },
    {
        accessorFn: row => formatNumberIST(row.discountAmount),
        id: 'discountAmount',
        header: 'Discount',
        cell: info => info.getValue(),
    },
    {
        accessorFn: row => formatNumberIST(row.netAmount),
        id: 'netAmount',
        header: 'Net Amount',
        cell: info => info.getValue(),
    },

];

interface PaymentAndReceiptFormProps {
    voucherType: VoucherTypeEnum;
    voucherId?: string;
    isInModal?: boolean;
    onSuccessfulSubmit?: () => void;
}

function PaymentAndReceiptForm({ voucherType, voucherId = undefined, isInModal = false, onSuccessfulSubmit }: PaymentAndReceiptFormProps) {
    const accessId = getAccessIdOrRedirect();
    const financialYear = useAppSelector(selectCurrentFinancialYear);
    const [currentVoucherId, setCurrentVoucherId] = useState(voucherId);
    const [lastVoucherDate, setLastVoucherDate] = useState<Date | null>(null);
    const [totals, setTotals] = useState({ totalBasicAmount: 0, totalDiscountAmount: 0, totalNetAmount: 0 });
    const { register, handleSubmit, setValue, watch, control, formState: { errors, isSubmitting }, reset } = useForm<PaymentAndReceiptDto>({
        mode: "all",
    });
    const [showAccountModal, setShowAccountModal] = useState(false);
    const [showControlPanelModal, setShowControlPanelModal] = useState(false);
    const [accountOptions, setAccountOptions] = useState<OptionType[]>([]);
    const [entriesList, setEntriesList] = useState<PaymentAndReceiptDto[]>([]);
    const [useReceiptNumber, setUseReceiptNumber] = useState(true);
    const [showTradingAccounts, setShowTradingAccounts] = useState(false);
    const [showBankAccounts, setShowBankAccounts] = useState(false);

    const voucherDateRef = useRef<HTMLInputElement>(null);
    const voucherDate = watch("voucherDate");
    const basicAmount = watch("basicAmount", 0);
    const discountAmount = watch("discountAmount", 0);

    useEffect(() => {
        if (accessId && financialYear && voucherType !== undefined && voucherId == undefined) {
            getLastVoucherDate(accessId, voucherType, financialYear)
                .then(date => {
                    setLastVoucherDate(date);
                    setTimeout(() => {
                        if (voucherDateRef.current) {
                            voucherDateRef.current.focus();
                            voucherDateRef.current.select();
                        }
                    }, 100); // A delay of 100 milliseconds
                })
                .catch(error => {
                    console.error('Error fetching last voucher date:', error);
                    toast.error('Failed to fetch last voucher date.');
                });

        }
    }, [accessId, financialYear, voucherType, voucherId]);
    const fetchAccounts = async (currentVoucherDate: Date | string) => {
        if (!financialYear) return Promise.resolve();
        const financialYearFrom = financialYear.financialYearFrom;
        try {
            const accounts = await agent.PaymentAndReceipt.getAccountsForDropDownListPaymentOrReceipt(
                accessId,
                financialYearFrom.toString(),
                formatDateForBackend(currentVoucherDate),
                voucherType,
                showBankAccounts,
                showTradingAccounts,
            );
            const transformedAccounts = accounts.map(transformAccountToOption);
            setAccountOptions(transformedAccounts);
            return Promise.resolve();
        } catch (error) {
            toast.error('Failed to fetch accounts for dropdown.');
            console.error(error);
            return Promise.reject();
        }
    };
    const fetchEntriesAsPerDate = async () => {
        try {
            setTotals({ totalBasicAmount: 0, totalDiscountAmount: 0, totalNetAmount: 0 });
            const dateToUse = validateDate(voucherDate) ? voucherDate : '';
            if (dateToUse) {
                const formattedDate = formatDateForBackend(dateToUse);
                const response = await agent.PaymentAndReceipt.getAllPaymentOrReceiptVouchersByDate(accessId, formattedDate, voucherType);
                setEntriesList(response.entries);
                setTotals(response.totals);
            }
        } catch (error) {
            toast.error('Failed to fetch Entries List.');
            console.error(error);
        }
    };
    const fetchControlOptions = async () => {
        try {
            if (voucherType != undefined) {
                const options: ControlOptionDto[] = await agent.ControlOptions.list(accessId, voucherType);
                options.forEach(option => {
                    switch (option.controlOption) {
                        case 'Ask for Receipt Number':
                            setUseReceiptNumber(option.controlValue === 'Y');
                            break;
                        case 'Ask for Password to Delete':
                            // setIsPasswordRequiredToDelete(option.controlValue === 'Y');
                            break;
                        case 'Set Maximum Cash Amount':
                            // setMaxPaymentAmount(parseInt(option.controlValue, 10));
                            break;
                        case 'Allow Entries on Sunday':
                            //setAllowEntriesOnSunday(option.controlValue === 'Y');
                            break;
                        case 'Show Trading Accounts':
                            setShowTradingAccounts(option.controlValue === 'Y');
                            break;
                        case 'Show Bank Accounts':
                            setShowBankAccounts(option.controlValue === 'Y');
                            break;
                        default:
                            break;
                    }

                });
            }
        } catch (error) {
            toast.error('Failed to load control options.');
        }
    };
    useEffect(() => {
        fetchControlOptions();
    }, [accessId]);

    useEffect(() => {
        if (validateDate(voucherDate) && currentVoucherId == undefined) {
            fetchAccounts(voucherDate);
        }
    }, [accessId, voucherDate]);

    function handleEdit(row: PaymentAndReceiptDto): void {
        if (row.voucherId) {
            setCurrentVoucherId(row.voucherId);
            setValue('receiptNumber', row.receiptNumber ?? '');
            setValue('accountId', row.accountId);
            setValue('basicAmount', row.basicAmount);
            setValue('discountAmount', row.discountAmount);
            setValue('netAmount', row.netAmount);
            setValue('remarks', row.remarks ?? '');
            setValue('voucherDate', '');
            setLastVoucherDate(new Date(row.voucherDate));
            setTimeout(() => {
                if (voucherDateRef.current) {
                    voucherDateRef.current.focus();
                    voucherDateRef.current.select();
                }
            }, 100);

        }
    };
    const onSubmit = async (data: PaymentAndReceiptDto) => {
        try {
            if (voucherType == undefined) {
                toast.error("Invalid Voucher Type. Data cannot be saved.");
                return;
            }
            data.voucherDate = formatDateForBackend(data.voucherDate.toString());
            data.voucherType = voucherType;
            const numericFields: (keyof PaymentAndReceiptDto)[] = ['basicAmount', 'discountAmount', 'netAmount'];
            const processedData = convertNullOrEmptyToZero(data, numericFields);

            if (Number(data.netAmount) <= 0) {
                toast.error("Net amount must be greater than zero.");
                return;
            }
            if (currentVoucherId) {
                await agent.PaymentAndReceipt.savePaymentOrReceipt(accessId, processedData, currentVoucherId);
                toast.success('Voucher updated successfully');
            } else {
                await agent.PaymentAndReceipt.savePaymentOrReceipt(accessId, processedData);
                toast.success('Voucher created successfully');
            }
            if (isInModal && onSuccessfulSubmit) {
                onSuccessfulSubmit();
            }
            fetchEntriesAsPerDate();
            resetForm();
        } catch (error) {
            console.error('Error in onSubmit:', error);
            handleApiErrors(error);
        }
    };
    const handleDelete = async () => {
        if (voucherType !== undefined && currentVoucherId !== undefined) {
            if (window.confirm("Are you sure you want to delete this voucher?")) {
                try {
                    await agent.Vouchers.delete(accessId, currentVoucherId, voucherType);
                    toast.success("Voucher deleted successfully");
                    if (isInModal && onSuccessfulSubmit) {
                        onSuccessfulSubmit();
                    }
                    resetForm();
                    fetchEntriesAsPerDate();
                } catch (error) {
                    console.error('Error deleting voucher:', error);
                    handleApiErrors(error);
                }
            }
        }
    };
    const resetForm = () => {
        const resetValues = {
            receiptPrefix: '',
            receiptNumber: '',
            accountId: '',
            accountName: '',
            basicAmount: 0,
            discountAmount: 0,
            netAmount: 0,
            remarks: '',
            voucherId: null
        };
        setCurrentVoucherId(undefined);
        reset(resetValues);
        setTimeout(() => {
            if (voucherDateRef.current) {
                voucherDateRef.current.focus();
                voucherDateRef.current.select();
            }
        }, 0);
    }
    useEffect(() => {
        const calcCashAmount = () => {
            const basicAmt = Number(basicAmount);
            const discountAmt = Number(discountAmount);

            if (discountAmt > basicAmt) {
                setValue('discountAmount', 0);
                toast.error("Discount amount cannot be greater than Total Amount.");
                return basicAmt;
            } else {
                return basicAmt - discountAmt;
            }
        };
        setValue('netAmount', calcCashAmount());
    }, [basicAmount, discountAmount, voucherType]);

    useEffect(() => {
        const getVoucherById = async () => {
            if (voucherId == undefined || !isInModal)
                return;
            try {
                const voucher = await agent.PaymentAndReceipt.getPaymentOrReceiptVoucherById(accessId, voucherId);
                if (voucher) {
                    setCurrentVoucherId(voucherId);
                    const newVoucherDate = new Date(voucher.voucherDate);
                    setLastVoucherDate(newVoucherDate);
                    setValue('receiptNumber', voucher.receiptNumber ?? '');
                    await fetchAccounts(newVoucherDate);

                    setAccountOptions((prevOptions) => {
                        const selectedAccountOption = prevOptions.find(option => option.value === voucher.accountId);
                        if (selectedAccountOption) {
                            setValue('accountId', selectedAccountOption.value);
                            setValue('accountName', voucher.accountName ?? '');
                        }
                        return prevOptions;
                    });
                    setValue('accountName', voucher.accountName ?? '');
                    setValue('basicAmount', voucher.basicAmount);
                    setValue('discountAmount', voucher.discountAmount);
                    setValue('netAmount', voucher.netAmount);
                    setValue('remarks', voucher.remarks ?? '');
                    setValue('voucherDate', formatDateForFrontend(newVoucherDate));

                    setTimeout(() => {
                        if (voucherDateRef.current) {
                            voucherDateRef.current.focus();
                            voucherDateRef.current.select();
                        }
                    }, 100);
                }
            } catch (error) {
                console.error('Error fetching voucher details:', error);
                toast.error('Failed to fetch voucher details.');
            }
        };
        getVoucherById();
    }, [accessId, voucherId]);

    useEffect(() => {
        fetchEntriesAsPerDate();
    }, [voucherDate]);

    return (
        <>
            <FormNavigator onSubmit={handleSubmit(onSubmit)} isModalOpen={isInModal}>
                <CommonCard header={voucherType == undefined ? "" : getVoucherTypeString(voucherType)} size="100%" onControlPanelClick={() => { setShowControlPanelModal(true); }} showControlPanelButton>
                    <Row>
                        <Col xs={12} md={2}>
                            <CustomDateInputBox
                                label="Date"
                                name="voucherDate"
                                validationRules={{ required: 'Date is required.' }}
                                register={register}
                                setValue={setValue}
                                error={errors.voucherDate}
                                financialYear={financialYear}
                                defaultDate={lastVoucherDate}
                                autoFocus
                                WarningForAdvanceEntry={!currentVoucherId}
                                inputRef={voucherDateRef}
                            />
                        </Col>
                        <Col xs={12} md={2}>
                            <CustomInput
                                label="Receipt No."
                                name="receiptNumber"
                                register={register}
                                maxLength={12}
                                disabled={!useReceiptNumber}
                            />
                        </Col>
                        <Col xs={12} md={5}>
                            <CustomDropdown
                                label="Account Name"
                                name="accountId"
                                options={accountOptions}
                                control={control}
                                error={errors.accountId}
                                validationRules={{ required: 'Account Name is required.' }}
                                isCreatable
                                onCreateButtonClick={() => { setShowAccountModal(true); }}
                            />
                        </Col>
                    </Row>
                    <Row>
                        <Col xs={4} md={2}>
                            <CustomInput
                                label="Total Amount"
                                name="basicAmount"
                                register={register}
                                allowedChars="numericDecimal"
                            />
                        </Col>
                        <Col xs={4} md={2}>
                            <CustomInput
                                label="Discount"
                                name="discountAmount"
                                register={register}
                                allowedChars="numericDecimal"
                            />
                        </Col>
                        <Col xs={4} md={2}>
                            <CustomInput
                                name="netAmount"
                                label="Cash Amount"
                                register={register}
                                allowedChars="numericDecimal"
                                disabled={true}
                            />
                        </Col>
                        <Col xs={10} md={3} className="">
                            <CustomInput
                                label="Remarks"
                                name="remarks"
                                register={register}
                                error={errors.remarks}
                            />
                        </Col>
                        <Col xs={2} md={3} className="d-flex align-items-end justify-content-left">
                            <CustomButton
                                text={currentVoucherId ? 'Update' : 'Save'}
                                className='mb-2 w-100'
                                isSubmitting={isSubmitting}
                            />
                            {currentVoucherId &&
                                <CustomButton
                                    text='Delete'
                                    variant='danger'
                                    className='mb-2 w-100 m-2'
                                    onClick={() => handleDelete()}
                                />
                            }
                        </Col>
                    </Row>

                    <Row className='mt-2'>
                        <CommonTable
                            data={entriesList}
                            columns={columns}
                            // onDelete={(row) => row.voucherId && handleDelete(row.voucherId)}
                            onRowClick={(row) => row.voucherId && handleEdit(row)}
                            showSrNo
                        />
                    </Row>
                    <Row className='justify-content-end'>
                        <Col xs={4} md={5} className="d-flex">
                            <CustomInput
                                name="totalBasicAmount"
                                value={formatNumberIST(totals.totalBasicAmount)}
                                disabled={true}
                                className='m-1'
                                allowedChars='numericDecimal'
                            />
                            <CustomInput
                                name="totalDiscountAmount"
                                value={formatNumberIST(totals.totalDiscountAmount)}
                                disabled={true}
                                className='m-1'
                                allowedChars='numericDecimal'
                            />
                            <CustomInput
                                name="totalNetAmount"
                                value={formatNumberIST(totals.totalNetAmount)}
                                disabled={true}
                                className='m-1'
                                allowedChars='numericDecimal'
                            />
                        </Col>
                    </Row>
                </CommonCard>
            </FormNavigator >
            <CommonModal show={showAccountModal} onHide={() => {
                setShowAccountModal(false);
            }} size='xl'>
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
            <CommonModal show={showControlPanelModal} onHide={() => { setShowControlPanelModal(false); }} size='sm'>
                <Suspense fallback={<div>Loading...</div>}>
                    <ControlPanelForm voucherType={voucherType} onSaveSuccess={() => { fetchAccounts(voucherDate); fetchControlOptions(); setShowControlPanelModal(false); }} isModalOpen={showControlPanelModal} />
                </Suspense>
            </CommonModal>
        </>
    );
}

export default PaymentAndReceiptForm;


