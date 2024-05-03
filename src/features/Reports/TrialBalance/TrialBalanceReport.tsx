import React, { useEffect, useRef, useState } from 'react';
import { Col, Row, Table } from 'react-bootstrap';
import { FieldValues, useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import agent from '../../../app/api/agent';
import { CommonModal, CustomButton, CustomDateInputBox, FormNavigator } from '../../../app/components/Components';
import CommonCard from '../../../app/components/CommonCard';
import { useAppSelector } from '../../../app/store/configureStore';
import { selectCurrentFinancialYear } from '../../Masters/FinancialYear/financialYearSlice';
import { formatDateForBackend, validateDate } from '../../../app/utils/dateUtils';
import { formatNumberIST } from '../../../app/utils/numberUtils';
import { getAccessIdOrRedirect } from '../../Masters/Company/CompanyInformation';
import getLastVoucherDate from '../../../app/hooks/useLastVoucherDate';
import LedgerReport, { LedgerReportParams } from '../Ledger/LedgerReport';

const TrialBalanceReport = () => {
    const accessId = getAccessIdOrRedirect();
    const financialYear = useAppSelector(selectCurrentFinancialYear);
    const [lastVoucherDate, setLastVoucherDate] = useState<Date | null>(null);
    const [selectedAccount, setSelectedAccount] = useState<LedgerReportParams | null>(null);
    const [ledgerModalVisible, setLedgerModalVisible] = useState<boolean>(false);

    const { register, handleSubmit, setValue, watch, formState: { errors, isSubmitting } } = useForm({
        mode: "all",
    });
    const voucherDateRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (accessId && financialYear) {
            getLastVoucherDate(accessId, null, financialYear)
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
    }, [accessId, financialYear]);
    const [trialBalanceData, setTrialBalanceData] = useState<TrialBalanceDto | null>(null);

    const fetchTrialBalanceData = async (toDate: string) => {
        if (financialYear?.financialYearFrom !== undefined) {
            try {
                const data = await agent.Reports.getTrailBalanceReport(accessId, formatDateForBackend(financialYear?.financialYearFrom), formatDateForBackend(toDate));
                setTrialBalanceData(data);
            } catch (error) {
                console.error('Failed to fetch trial balance data:', error);
                toast.error('Failed to fetch trial balance report.');
            }
        }
    };

    const onSubmit = async (data: FieldValues) => {
        await fetchTrialBalanceData(data.toDate);
    };
    const toDate = watch("toDate");

    const handleRowClick = (accountId: string) => {
        if (validateDate(toDate) && financialYear?.financialYearFrom) {
            setSelectedAccount({ accountId, fromDate: financialYear?.financialYearFrom, toDate: toDate });
            setLedgerModalVisible(true);
        }
    };


    return (
        <>
            <CommonCard header='Trial Balance' size='100%'>
                <FormNavigator onSubmit={handleSubmit(onSubmit)}>
                    <Row className="mb-1">
                        <Col xs={6} md={2}>
                            <CustomDateInputBox
                                autoFocus
                                name="toDate"
                                register={register}
                                setValue={setValue}
                                validationRules={{ required: 'To Date is required' }}
                                financialYear={financialYear}
                                inputRef={voucherDateRef}
                                error={errors.voucherDate}
                                defaultDate={lastVoucherDate}

                            />
                        </Col>

                        <Col xs={12} md={4} className="d-flex align-items-end">
                            <CustomButton text="Show" type="submit" isSubmitting={isSubmitting} />
                        </Col>
                    </Row>
                </FormNavigator>
                {
                    trialBalanceData && (
                        <div style={{ maxHeight: '550px', overflowY: 'auto' }}> {/* Adjust maxHeight as needed */}
                            <Table bordered hover size="sm" className='custom-table'>
                                <thead>
                                    <tr>
                                        <th></th>
                                        <th className="text-center" colSpan={2}>Opening Balance</th>
                                        <th className="text-center" colSpan={2}>Transactions</th>
                                        <th className="text-center" colSpan={2}>Closing Balance</th>
                                    </tr>
                                    <tr>
                                        <th className="text-right">Particulars</th>
                                        <th className="text-center">Debit</th>
                                        <th className="text-center">Credit</th>
                                        <th className="text-center">Debit</th>
                                        <th className="text-center">Credit</th>
                                        <th className="text-center">Debit</th>
                                        <th className="text-center">Credit</th>
                                    </tr>

                                </thead>
                                <tbody>
                                    {trialBalanceData.accountGroups.map((group: TrialBalanceAccountGroupsDto) => (
                                        <React.Fragment key={group.accountGroupId}>
                                            <tr style={{ backgroundColor: '#e0f2f1', fontWeight: 'bold' }}>
                                                <td style={{ backgroundColor: '#e0f2f1', fontWeight: 'bold' }}>{group.accountGroupName}</td>
                                                <td style={{ backgroundColor: '#e0f2f1', fontWeight: 'bold' }} className="text-end">{formatNumberIST(group.debitOpeningBalance)}</td>
                                                <td style={{ backgroundColor: '#e0f2f1', fontWeight: 'bold' }} className="text-end">{formatNumberIST(group.creditOpeningBalance)}</td>
                                                <td style={{ backgroundColor: '#e0f2f1', fontWeight: 'bold' }} className="text-end">{formatNumberIST(group.debitTransactionBalance)}</td>
                                                <td style={{ backgroundColor: '#e0f2f1', fontWeight: 'bold' }} className="text-end">{formatNumberIST(group.creditTransactionBalance)}</td>
                                                <td style={{ backgroundColor: '#e0f2f1', fontWeight: 'bold' }} className="text-end">{formatNumberIST(group.debitClosingBalance)}</td>
                                                <td style={{ backgroundColor: '#e0f2f1', fontWeight: 'bold' }} className="text-end">{formatNumberIST(group.creditClosingBalance)}</td>
                                            </tr>

                                            {group.accounts.map((account) => (
                                                <tr key={account.accountId} onClick={() => handleRowClick(account.accountId)}>
                                                    <td>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{account.accountName}</td>
                                                    <td className="text-end">{formatNumberIST(account.debitOpeningBalance)}</td>
                                                    <td className="text-end">{formatNumberIST(account.creditOpeningBalance)}</td>
                                                    <td className="text-end">{formatNumberIST(account.debitTransactionBalance)}</td>
                                                    <td className="text-end">{formatNumberIST(account.creditTransactionBalance)}</td>
                                                    <td className="text-end">{formatNumberIST(account.debitClosingBalance)}</td>
                                                    <td className="text-end">{formatNumberIST(account.creditClosingBalance)}</td>
                                                </tr>
                                            ))}
                                        </React.Fragment>
                                    ))}

                                </tbody>
                                <tfoot className="table-footer">
                                    <tr className="grand-total">
                                        <td><strong>Grand Total</strong></td>
                                        <td className="text-end"><strong>{formatNumberIST(trialBalanceData.grandTotalDebitOpening)}</strong></td>
                                        <td className="text-end"><strong>{formatNumberIST(trialBalanceData.grandTotalCreditOpening)}</strong></td>
                                        <td className="text-end"><strong>{formatNumberIST(trialBalanceData.grandTotalDebitTransaction)}</strong></td>
                                        <td className="text-end"><strong>{formatNumberIST(trialBalanceData.grandTotalCreditTransaction)}</strong></td>
                                        <td className="text-end"><strong>{formatNumberIST(trialBalanceData.grandTotalDebitClosing)}</strong></td>
                                        <td className="text-end"><strong>{formatNumberIST(trialBalanceData.grandTotalCreditClosing)}</strong></td>
                                    </tr>
                                    <tr className="differences">
                                        <td><strong>Difference</strong></td>
                                        <td className="text-end" colSpan={2}><strong>{trialBalanceData.openingBalanceDifference}</strong></td>
                                        <td className="text-end" colSpan={4}><strong>{trialBalanceData.closingBalanceDifference}</strong></td>
                                    </tr>
                                </tfoot>
                            </Table>
                        </div>
                    )
                }
            </CommonCard>
            <CommonModal show={ledgerModalVisible} onHide={() => {
                setLedgerModalVisible(false);
                setSelectedAccount(null);

            }} size='xl'>
                {selectedAccount && (
                    <LedgerReport isInModal={true} ledgerParams={selectedAccount} onSuccessfulSubmit={() => fetchTrialBalanceData(toDate)} />
                )}
            </CommonModal>
        </>
    );
};

export default TrialBalanceReport;
