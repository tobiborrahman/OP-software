
import CommonCard from '../../../app/components/CommonCard';
import FormNavigator from '../../../app/components/FormNavigator';
import { Col, Row, Table } from 'react-bootstrap';
import { CustomButton, CustomDateInputBox, CustomDropdown } from '../../../app/components/Components';
import { useAppSelector } from '../../../app/store/configureStore';
import { selectCurrentFinancialYear } from '../../Masters/FinancialYear/financialYearSlice';
import { FieldValues, useForm } from 'react-hook-form';
import agent from '../../../app/api/agent';
import { formatDateForBackend, formatDateForFrontend, validateDate } from '../../../app/utils/dateUtils';
import toast from 'react-hot-toast';
import { useEffect, useState } from 'react';
import { OptionType } from '../../../app/models/optionType';
import { transformAccountToOption } from '../../../app/utils/accountUtils';
import { formatNumberIST } from '../../../app/utils/numberUtils';
import { VoucherTypeEnum, getVoucherTypeString } from '../../Vouchers/VoucherCommon/voucherTypeEnum';
import CommonModal from '../../../app/components/CommonModal';
import PaymentAndReceiptForm from '../../Vouchers/VoucherCommon/PaymentAndReceiptForm';
import BankEntryForm from '../../Vouchers/BankEntry/BankEntryForm';
import getLastVoucherDate from '../../../app/hooks/useLastVoucherDate';
import JournalEntryForm from '../../Vouchers/JournalEntry/JournalEntryForm';
import { getAccessIdOrRedirect } from '../../Masters/Company/CompanyInformation';


export interface LedgerReportDto {
    voucherId: string;
    voucherTypeId: number;
    voucherPrefix: string;
    voucherNumber: string;
    voucherDate: Date;
    accountName: string;
    debitAmount: number;
    creditAmount: number;
    remarks: string;
}
export interface LedgerReportParams {
    accountId: string;
    fromDate: Date;
    toDate: Date;
}


interface LedgerReportProps {
    isInModal?: boolean;
    onSuccessfulSubmit?: () => void;
    ledgerParams?: LedgerReportParams | null;
}


const LedgerReport = ({ isInModal = false, ledgerParams = null, onSuccessfulSubmit }: LedgerReportProps) => {
    const accessId = getAccessIdOrRedirect();
    const financialYear = useAppSelector(selectCurrentFinancialYear);
    const [accountOptions, setAccountOptions] = useState<OptionType[]>([]);
    const [ledgerEntries, setLedgerEntries] = useState<LedgerReportDto[]>([]);
    const [lastVoucherDate, setLastVoucherDate] = useState<Date | null>(null);

    const [showVoucherModal, setShowVoucherModal] = useState(false);
    const [selectedVoucher, setSelectedVoucher] = useState<LedgerReportDto | null>(null);
    const [accountId, setAccountId] = useState('');
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');

    const [openingBalance, setOpeningBalance] = useState(0);
    const [debitTotal, setDebitTotal] = useState(0);
    const [creditTotal, setCreditTotal] = useState(0);
    const [finalBalance, setFinalBalance] = useState(0);

    useEffect(() => {
        if (accessId && financialYear && !isInModal) {
            getLastVoucherDate(accessId, null, financialYear)
                .then(date => {
                    setLastVoucherDate(date);
                })
                .catch(error => {
                    console.error('Error fetching last voucher date:', error);
                    toast.error('Failed to fetch last voucher date.');
                });
        }
    }, [accessId, financialYear]);


    const calculateRunningBalanceLabel = (currentTotal: number): string => {
        return currentTotal > 0
            ? `${formatNumberIST(Math.abs(currentTotal))} DR`
            : currentTotal < 0
                ? `${formatNumberIST(Math.abs(currentTotal))} CR`
                : 'NIL';
    };


    const { register, handleSubmit, setValue, watch, control, formState: { errors, isSubmitting } } = useForm<FieldValues>({
        mode: "all",
    });
    const voucherDate = watch("toDate");

    const fetchLedgerData = async (accountId: string, fromDate: string, toDate: string) => {
        try {
            if (financialYear?.financialYearFrom == undefined) {
                toast.error("Select financial year.");
                return null;
            }
            const response = await agent.Reports.getLedgerReport(accessId, accountId, formatDateForBackend(fromDate), formatDateForBackend(toDate), formatDateForBackend(financialYear?.financialYearFrom.toString()));
            setLedgerEntries(response);
            setAccountId(accountId);
            setFromDate(fromDate);
            setToDate(toDate);
        } catch (error) {
            toast.error('Failed to fetch ledger report.');
            console.error(error);
        }

    };
    const onSubmit = async (data: FieldValues) => {
        await fetchLedgerData(data.accountId, data.fromDate, data.toDate);
    };
    const handleCloseModal = () => {
        setShowVoucherModal(false);
        setSelectedVoucher(null);
        fetchLedgerData(accountId, fromDate, toDate);
        if (isInModal && ledgerParams != null && onSuccessfulSubmit) {
            onSuccessfulSubmit();
        }
    };

    const fetchAccounts = async (voucherDate: string | Date) => {
        if (!accessId || !financialYear) return;
        const financialYearFrom = financialYear.financialYearFrom;
        try {
            const accounts = await agent.Account.getAllAccountsForDropDownList(
                accessId,
                financialYearFrom.toString(),
                formatDateForBackend(voucherDate)
            );
            const transformedAccounts = accounts.map(transformAccountToOption);
            setAccountOptions(transformedAccounts);
        } catch (error) {
            toast.error('Failed to fetch accounts for dropdown.');
            console.error(error);
        }
    };
    useEffect(() => {
        if (voucherDate && validateDate(voucherDate) && !isInModal) {
            fetchAccounts(voucherDate);
        }
    }, [accessId, voucherDate]);

    useEffect(() => {
        const getLedgerReportFromTrialBalance = async () => {
            if (ledgerParams != null && isInModal) {
                setLastVoucherDate(ledgerParams.toDate);
                await fetchAccounts(ledgerParams.toDate);
                setAccountOptions((prevOptions) => {
                    const selectedAccountOption = prevOptions.find(option => option.value === ledgerParams.accountId);
                    if (selectedAccountOption) {
                        setValue('accountId', selectedAccountOption.value);
                    }
                    return prevOptions;
                });

                await fetchLedgerData(ledgerParams.accountId, ledgerParams.fromDate.toString(), ledgerParams.toDate.toString());
            }
        }
        getLedgerReportFromTrialBalance();
    }, [accessId])


    useEffect(() => {
        let tempDebitTotal = 0;
        let tempCreditTotal = 0;
        ledgerEntries.forEach((entry, index) => {
            tempDebitTotal += entry.debitAmount;
            tempCreditTotal += entry.creditAmount;
            if (index === 0) {
                if (entry.voucherTypeId == 7)
                    setOpeningBalance(entry.debitAmount - entry.creditAmount);
            }
        });
        setDebitTotal(tempDebitTotal);
        setCreditTotal(tempCreditTotal);
        setFinalBalance(tempDebitTotal - tempCreditTotal);
    }, [ledgerEntries]);

    const handleRowClick = (voucher: LedgerReportDto) => {
        setSelectedVoucher(voucher);
        setShowVoucherModal(true);
    };

    return (
        <>
            <CommonCard header='Ledger' size='100%'>
                <FormNavigator onSubmit={handleSubmit(onSubmit)} isModalOpen={isInModal}>
                    <Row>
                        <Col xs={12} md={2}>
                            <CustomDateInputBox
                                autoFocus
                                label="From Date"
                                name="fromDate"
                                validationRules={{ required: 'Date is required.' }}
                                register={register}
                                setValue={setValue}
                                financialYear={financialYear}
                                defaultDate={financialYear?.financialYearFrom}
                            />
                        </Col>
                        <Col xs={12} md={2}>
                            <CustomDateInputBox
                                autoFocus
                                label="To Date"
                                name="toDate"
                                validationRules={{ required: 'Date is required.' }}
                                register={register}
                                setValue={setValue}
                                financialYear={financialYear}
                                defaultDate={lastVoucherDate}
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
                            />
                        </Col>
                        <Col xs={2} md={2} className="d-flex align-items-end justify-content-left">
                            <CustomButton
                                text='Show'
                                className='mb-2 w-100'
                                isSubmitting={isSubmitting}
                            />
                        </Col>
                    </Row>
                    <Row>
                        <div className="custom-table-container">
                            <Table striped bordered hover className='mt-3 custom-table'>
                                <thead>
                                    <tr>
                                        <th style={{ width: '10%' }}>Date</th>
                                        <th style={{ width: '10%' }}>Type</th>
                                        <th style={{ width: '10%' }}>Voucher No.</th>
                                        <th style={{ width: '20%' }}>Account</th>
                                        <th style={{ width: '20%' }}>Remarks</th>
                                        <th style={{ width: '10%', textAlign: 'right' }}>Debit (DR)</th>
                                        <th style={{ width: '10%', textAlign: 'right' }}>Credit (CR)</th>
                                        <th style={{ width: '20%', textAlign: 'right' }}>Balance</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {(() => {
                                        let runningTotal = 0;
                                        return ledgerEntries.map((entry, index) => {
                                            runningTotal += entry.debitAmount - entry.creditAmount;
                                            const voucherTypeString = getVoucherTypeString(entry.voucherTypeId as VoucherTypeEnum);
                                            return (
                                                <tr key={index} onClick={() => handleRowClick(entry)}>
                                                    <td>{formatDateForFrontend(entry.voucherDate)}</td>
                                                    <td>{voucherTypeString}</td>
                                                    <td>{entry.voucherPrefix?.toString()}{entry.voucherNumber?.toString()}</td>
                                                    <td>{entry.accountName}</td>
                                                    <td>{entry.remarks}</td>
                                                    <td style={{ textAlign: 'right' }}>
                                                        {entry.debitAmount > 0 ? formatNumberIST(entry.debitAmount) : ''}
                                                    </td>
                                                    <td style={{ textAlign: 'right' }}>
                                                        {entry.creditAmount > 0 ? formatNumberIST(entry.creditAmount) : ''}
                                                    </td>
                                                    <td style={{ textAlign: 'right' }}>
                                                        {calculateRunningBalanceLabel(runningTotal)}
                                                    </td>
                                                </tr>
                                            );
                                        });

                                    })()}
                                </tbody>
                            </Table>
                        </div>
                    </Row>
                    <Row className="justify-content-end mt-3">
                        <Col xs="auto">
                            <Table bordered hover className='custom-table'>
                                <tbody>
                                    <tr>
                                        <td>Opening Balance</td>
                                        <td>Debit Total</td>
                                        <td>Credit Total</td>
                                        <td>Closing Balance</td>
                                    </tr>
                                    <tr>
                                        <td className="text-end">{openingBalance !== 0 ? calculateRunningBalanceLabel(openingBalance) : ''}</td>
                                        <td className="text-end">{formatNumberIST(debitTotal)} DR</td>
                                        <td className="text-end">{formatNumberIST(creditTotal)} CR</td>
                                        <td className="text-end">{calculateRunningBalanceLabel(finalBalance)}</td>
                                    </tr>
                                </tbody>
                            </Table>
                        </Col>
                    </Row>
                </FormNavigator>
            </CommonCard>
            <CommonModal show={showVoucherModal} onHide={() => {
                setShowVoucherModal(false);
                setSelectedVoucher(null);

            }} size='xl'>
                {selectedVoucher && selectedVoucher.voucherTypeId === VoucherTypeEnum.Payment && (
                    <PaymentAndReceiptForm voucherId={selectedVoucher.voucherId} voucherType={VoucherTypeEnum.Payment} isInModal={true} onSuccessfulSubmit={handleCloseModal} />
                )}
                {selectedVoucher && selectedVoucher.voucherTypeId === VoucherTypeEnum.Receipt && (
                    <PaymentAndReceiptForm voucherId={selectedVoucher.voucherId} voucherType={VoucherTypeEnum.Receipt} isInModal={true} onSuccessfulSubmit={handleCloseModal} />
                )}
                {selectedVoucher && selectedVoucher.voucherTypeId === VoucherTypeEnum.BankEntry && (
                    <BankEntryForm voucherId={selectedVoucher.voucherId} isInModal={true} onSuccessfulSubmit={handleCloseModal} />
                )}
                {selectedVoucher && selectedVoucher.voucherTypeId === VoucherTypeEnum.JournalEntry && (
                    <JournalEntryForm voucherId={selectedVoucher.voucherId} isInModal={true} onSuccessfulSubmit={handleCloseModal} />
                )}
            </CommonModal>


        </>
    )
}

export default LedgerReport
