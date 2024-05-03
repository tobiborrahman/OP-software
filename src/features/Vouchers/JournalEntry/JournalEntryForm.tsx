import { useState, useEffect, useRef, Suspense } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { CommonCard, CustomInput, CustomButton, FormNavigator, CustomDropdown, CustomDateInputBox } from '../../../app/components/Components';
import { Row, Col, Table } from 'react-bootstrap';
import agent from '../../../app/api/agent';
import { useAppSelector } from '../../../app/store/configureStore';
import { selectCurrentFinancialYear } from '../../Masters/FinancialYear/financialYearSlice';
import { formatDateForBackend, validateDate } from '../../../app/utils/dateUtils';
import { AccountDtoForDropDownList } from '../../Masters/Account/accountDto';
import { VoucherTypeEnum } from '../VoucherCommon/voucherTypeEnum';
import { transformAccountToOption } from '../../../app/utils/accountUtils';
import toast from 'react-hot-toast';
import CommonModal from '../../../app/components/CommonModal';
import AccountForm from '../../Masters/Account/AccountForm';
import CustomLabel from '../../../app/components/CustomLabel';
import handleApiErrors from '../../../app/errors/handleApiErrors';
import getLastVoucherDate from '../../../app/hooks/useLastVoucherDate';
import { getAccessIdOrRedirect } from '../../Masters/Company/CompanyInformation';

interface JournalEntryFormProps {
    voucherId?: string;
    isInModal?: boolean;
    onSuccessfulSubmit?: () => void;
    
}

function JournalEntryForm({ voucherId = undefined, isInModal = false, onSuccessfulSubmit }: JournalEntryFormProps) {
    const accessId = getAccessIdOrRedirect();
    const financialYear = useAppSelector(selectCurrentFinancialYear);
    const [currentVoucherId, setCurrentVoucherId] = useState(voucherId);
    const [lastVoucherDate, setLastVoucherDate] = useState<Date | null>(null);

    const { control, handleSubmit, register, getValues, reset, formState: { errors, isSubmitting }, watch, setValue } = useForm<JournalEntryDto>({
        defaultValues: {
            entries: [{ type: 'Debit', accountId: '', amount: 0, remarks: '' }],
        },
    });
    const { fields, append } = useFieldArray({
        control,
        name: 'entries',
    });

    const entries = getValues('entries');
    const debitTotal = entries.reduce((acc, entry) => entry.type === 'Debit' ? acc + parseFloat(entry.amount.toString() || "0") : acc, 0);
    const creditTotal = entries.reduce((acc, entry) => entry.type === 'Credit' ? acc + parseFloat(entry.amount.toString() || "0") : acc, 0);


    const handleAmountChange = () => {
        const entries = getValues('entries');

        let debitTotal = 0;
        let creditTotal = 0;

        for (const entry of entries) {
            const amount = entry.amount === "" ? 0 : parseFloat(entry.amount.toString());
            if (entry.type === 'Debit') {
                debitTotal += amount;
            } else {
                creditTotal += amount;
            }
        }
        if (debitTotal !== creditTotal) {
            const balanceAmount = Math.abs(debitTotal - creditTotal);
            const type = debitTotal > creditTotal ? "Credit" : "Debit";
            append({ type: type, accountId: '', amount: balanceAmount, remarks: '' });
        }

    };
    const getFilteredAccountOptions = (index: number) => {
        const selectedAccountIds = getValues('entries').slice(0, index).map(entry => entry.accountId);
        return accountOptions.filter(option => !selectedAccountIds.includes(option.accountID));
    };

    const [showAccountModal, setShowAccountModal] = useState(false);
    const [accountOptions, setAccountOptions] = useState<AccountDtoForDropDownList[]>([]);
    const voucherDateRef = useRef<HTMLInputElement>(null);
    const voucherDate = watch("voucherDate");

    useEffect(() => {
        if (accessId && financialYear && voucherId == undefined) {
            getLastVoucherDate(accessId, VoucherTypeEnum.JournalEntry, financialYear)
                .then(date => {
                    setLastVoucherDate(date);
                    setTimeout(() => {
                        if (voucherDateRef.current) {
                            voucherDateRef.current.focus();
                            voucherDateRef.current.select();
                        }
                    }, 100);

                })
                .catch(error => {
                    console.error('Error fetching last voucher date:', error);
                    toast.error('Failed to fetch last voucher date.');
                });
        }
    }, [accessId, financialYear]);

    const fetchAccounts = async (currentVoucherDate: Date | string) => {
        if (!accessId || !financialYear) return;
        const financialYearFrom = financialYear.financialYearFrom;
        try {
            const accounts = await agent.JournalEntry.GetAccountsForDropDownListJournalEntry(
                accessId,
                financialYearFrom.toString(),
                formatDateForBackend(currentVoucherDate)
            );
            setAccountOptions(accounts);
        } catch (error) {
            toast.error('Failed to fetch accounts for dropdown.');
            console.error(error);
        }
    };
    useEffect(() => {
        if (voucherDate && validateDate(voucherDate) && !currentVoucherId) {
            fetchAccounts(voucherDate);
        }
    }, [accessId, voucherDate]);

    const onSubmit = async (data: JournalEntryDto) => {
        const isUpdate = !!currentVoucherId;
        try {
            data.voucherDate = formatDateForBackend(data.voucherDate);

            // Check if any amount is less than or equal to zero
            const hasInvalidAmount = data.entries.some(entry => Number(entry.amount) <= 0);
            if (hasInvalidAmount) {
                toast.error("Amounts must be greater than zero.");
                return;
            }

            // Check if account name is empty for any entry
            const hasEmptyAccountName = data.entries.some(entry => entry.accountId === '');
            if (hasEmptyAccountName) {
                toast.error("Account name cannot be empty.");
                return;
            }

            // Check if total debit and credit amounts are equal
            if (debitTotal !== creditTotal) {
                toast.error("Debit and Credit totals must be equal.");
                return;
            }

            if (isUpdate) {
                await agent.JournalEntry.saveJournalEntry(accessId, data, currentVoucherId);
                toast.success('Voucher updated successfully');
            } else {
                await agent.JournalEntry.saveJournalEntry(accessId, data);
                toast.success('Voucher created successfully');
            }

            if (isInModal && onSuccessfulSubmit) {
                onSuccessfulSubmit();
            }

            resetForm();
        } catch (error) {
            console.error('Error in onSubmit:', error);
            handleApiErrors(error);
        }
    };

    const resetForm = () => {
        const resetValues: JournalEntryDto = {
            voucherDate: voucherDate,
            entries: [{ type: 'Debit', accountId: '', amount: '', remarks: '' }],
        };
        setCurrentVoucherId('');
        reset(resetValues);
    };

    const handleDelete = async () => {
        if (currentVoucherId !== undefined) {
            if (window.confirm("Are you sure you want to delete this voucher?")) {
                try {
                    await agent.Vouchers.delete(accessId, currentVoucherId, VoucherTypeEnum.JournalEntry);
                    toast.success("Voucher deleted successfully");
                    resetForm();

                    if (isInModal && onSuccessfulSubmit) {
                        onSuccessfulSubmit();
                    }
                } catch (error) {
                    console.error('Error deleting voucher:', error);
                    handleApiErrors(error);
                }
            }
        }
    };

    useEffect(() => {
        if (voucherId && accessId && isInModal) {
            getByVoucherId(voucherId);
        }
    }, [voucherId, accessId]);

    const getByVoucherId = async (id: string) => {
        try {
            const voucher = await agent.JournalEntry.getJournalEntryById(accessId, id);
            if (voucher) {
                setCurrentVoucherId(id);
                setLastVoucherDate(new Date(voucher.voucherDate));
                setValue('voucherDate', voucher.voucherDate);
                const currentFormValues = getValues();

                reset({
                    ...currentFormValues,
                    entries: [],
                });

                voucher.entries.forEach((entry) => {
                    append({ ...entry });
                });

                await fetchAccounts(voucher.voucherDate);

                setTimeout(() => {
                    if (voucherDateRef.current) {
                        voucherDateRef.current.focus();
                        voucherDateRef.current.select();
                    }
                }, 100);

            }
        } catch (error) {
            toast.error('Failed to fetch voucher details.');
            console.error('Error fetching voucher details:', error);
        }
    };


    return (
        <>
            <CommonCard header="Journal Entry" size="100%">
                <FormNavigator onSubmit={handleSubmit(onSubmit)} isModalOpen={isInModal}>
                    <Row>
                        <Col xs={12} md={2}>
                            <CustomDateInputBox
                                autoFocus
                                label="Date"
                                name="voucherDate"
                                validationRules={{ required: 'Date is required.' }}
                                register={register}
                                setValue={setValue}
                                error={errors.voucherDate}
                                financialYear={financialYear}
                                defaultDate={lastVoucherDate}
                                WarningForAdvanceEntry={true}
                                inputRef={voucherDateRef}
                            />
                        </Col>
                    </Row>
                    <Row className='mt-3'>
                        <Table bordered hover>
                            <thead>
                                <tr>
                                    <th style={{ width: '5%' }}>SrNo</th>
                                    <th style={{ width: '12%' }}>Debit/Credit</th>
                                    <th style={{ width: '*' }}>Account Name  [F3-New]</th>
                                    <th style={{ width: '15%' }}>Total Amount</th>
                                    <th style={{ width: '30%' }}>Remarks</th>
                                </tr>
                            </thead>
                            <tbody>
                                {fields.map((field, index) => (
                                    <tr key={field.id}>
                                        <td>{index + 1}</td>
                                        <td>
                                            <CustomDropdown
                                                label=""
                                                name={`entries[${index}].type`}
                                                options={[{ label: 'Debit', value: 'Debit' }, { label: 'Credit', value: 'Credit' }]}
                                                control={control}
                                                isSearchable={false}
                                            />
                                        </td>

                                        <td>
                                            <CustomDropdown
                                                label=""
                                                name={`entries[${index}].accountId`}
                                                options={getFilteredAccountOptions(index).map(transformAccountToOption)}
                                                control={control}
                                                validationRules={{ required: 'Account Name is required.' }}
                                                isCreatable
                                                onCreateButtonClick={() => { setShowAccountModal(true); }}
                                                showF3New={false}
                                            />
                                        </td>

                                        <td>
                                            <CustomInput
                                                name={`entries[${index}].amount`}
                                                register={register}
                                                allowedChars="numericDecimal"
                                                onBlur={handleAmountChange} />
                                        </td>
                                        <td>
                                            <CustomInput
                                                name={`entries[${index}].remarks`}
                                                register={register}
                                            />
                                        </td>
                                    </tr>
                                ))}

                                <tr>
                                    <td colSpan={3}><CustomLabel label='Totals' /> </td>
                                    <td><CustomLabel label={`Debit: ${debitTotal}`} /> </td>
                                    <td><CustomLabel label={`Credit: ${creditTotal}`} /></td>

                                </tr>
                            </tbody>
                        </Table>
                    </Row>
                    <Row className='d-flex justify-content-end'>

                        <Col xs={2} md={3} className="d-flex flex-column">
                            <div className="mb-2">
                                <CustomButton
                                    text={currentVoucherId ? 'Update' : 'Save'}
                                    isSubmitting={isSubmitting}
                                    showAtEnd
                                />
                            </div>
                            {currentVoucherId &&
                                <div>
                                    <CustomButton
                                        text='Delete'
                                        variant='danger'
                                        onClick={() => handleDelete()}
                                        showAtEnd
                                    />
                                </div>
                            }
                        </Col>

                    </Row>

                </FormNavigator>
            </CommonCard >
            <CommonModal show={showAccountModal} onHide={() => setShowAccountModal(false)} size='xl'>
                <Suspense fallback={<div>Loading...</div>}>
                    <AccountForm isModalOpen={showAccountModal} onCloseModalAfterSave={() => { fetchAccounts(voucherDate); setShowAccountModal(false); }} />
                </Suspense>
            </CommonModal>
        </>
    );
}

export default JournalEntryForm;
