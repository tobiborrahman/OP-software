import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { ColumnDef } from "@tanstack/react-table";
import { Col, Row } from "react-bootstrap";
import agent from "../../../app/api/agent";
import handleApiErrors from "../../../app/errors/handleApiErrors";
import { setLoading } from "../../../app/layout/loadingSlice";
import { useAppDispatch } from "../../../app/store/configureStore";
import { CommonCard, CommonTable, CustomButton, CustomDropdown, CustomInput, FormNavigator } from "../../../app/components/Components";
import { getAccessIdOrRedirect } from "../Company/CompanyInformation";

const TAX_TYPES_OPTIONS = [
    { label: "Inclusive Tax", value: "Inclusive Tax" },
    { label: "Exclusive Tax", value: "Exclusive Tax" },
];
const INVOICE_PRINT_OPTIONS = [
    { label: "Tax Invoice", value: "Tax Invoice" },
    { label: "Bill of Supply", value: "Bill of Supply" },
];

const defaultTermsAndConditions = {
    termsAndConditions1: "1. We are not responsible for loss and damage occurred by Transport in Transit",
    termsAndConditions2: "2. Interest @5% will be charged if payment is not made within 7 days",
    termsAndConditions3: "3. Items once sold not be taken back",
    termsAndConditions4: "4. I am liable to pay tax on the above and authorized to sign this Invoice",

};
const columns: ColumnDef<BillBookDto>[] = [
    {
        accessorFn: row => row.bookName,
        id: 'bookName',
        header: 'Book Name',
        cell: info => info.getValue(),
    },
    {
        accessorFn: row => row.voucherType,
        id: 'voucherType',
        header: 'Voucher Type',
        cell: info => info.getValue(),
    },
    {
        accessorFn: row => row.taxType,
        id: 'taxType',
        header: 'Tax Type',
        cell: info => info.getValue(),
    },
    {
        accessorFn: row => row.invoicePrefix,
        id: 'invoicePrefix',
        header: 'Invoice Prefix',
        cell: info => info.getValue(),
    },
    {
        accessorFn: row => row.invoiceFormat,
        id: 'invoiceFormat',
        header: 'Invoice Format',
        cell: info => info.getValue(),
    },
    {
        accessorFn: row => row.topHeader,
        id: 'topHeader',
        header: 'Top Header',
        cell: info => info.getValue(),
    },
    {
        accessorFn: row => row.dealsIn,
        id: 'dealsIn',
        header: 'Deals In',
        cell: info => info.getValue(),
    },
    // {
    //     accessorFn: row => row.termsAndConditions1,
    //     id: 'termsAndConditions1',
    //     header: 'T&C 1',
    //     cell: info => info.getValue(),
    // },

    // {
    //     accessorFn: row => row.termsAndConditions2,
    //     id: 'termsAndConditions2',
    //     header: 'T&C 2',
    //     cell: info => info.getValue(),
    // },

    // {
    //     accessorFn: row => row.termsAndConditions3,
    //     id: 'termsAndConditions3',
    //     header: 'T&C 3',
    //     cell: info => info.getValue(),
    // },

    // {
    //     accessorFn: row => row.termsAndConditions4,
    //     id: 'termsAndConditions4',
    //     header: 'T&C 4',
    //     cell: info => info.getValue(),
    // },

    // {
    //     accessorFn: row => row.termsAndConditions5,
    //     id: 'termsAndConditions5',
    //     header: 'T&C 5',
    //     cell: info => info.getValue(),
    // },

];

interface SaleBillBookFormProps {
    isModalOpen?: boolean;
    onSaveSuccess?: () => void;
}

function SaleBillBookForm({ isModalOpen = false, onSaveSuccess }: SaleBillBookFormProps) {

    const { register, handleSubmit, setValue, control, setFocus, formState: { isSubmitting, errors }, reset } = useForm<BillBookDto>({
        mode: "all",
        defaultValues: defaultTermsAndConditions,

    });
    const accessId = getAccessIdOrRedirect();
    const dispatch = useAppDispatch();
    const [billBooks, setBillBooks] = useState<BillBookDto[]>([]);
    const [isEditMode, setIsEditMode] = useState(false);
    const [editingBillBook, setEditingBillBook] = useState<BillBookDto | null>(null);



    const getAllBillBooks = async () => {
        dispatch(setLoading(true));
        try {
            const fetchedBillBooks = await agent.BillBook.getAllBillBooks(accessId);
            setBillBooks(fetchedBillBooks);
        } catch (error) {
            console.error("Error fetching bill books", error);
            toast.error("Error fetching bill books");
        } finally {
            dispatch(setLoading(false));
        }
    };

    useEffect(() => {
        getAllBillBooks();
    }, [dispatch]);

    const onSubmit = async (data: BillBookDto) => {
        dispatch(setLoading(true));
        data.voucherType = "Sale";
        try {
            if (accessId) {
                if (editingBillBook && editingBillBook.billBookId !== undefined) {
                    data.billBookId = editingBillBook.billBookId;
                    await agent.BillBook.updateBillBook(accessId, editingBillBook.billBookId, data);
                    toast.success('Bill book updated successfully');
                } else {
                    await agent.BillBook.createBillBook(accessId, data);
                    toast.success('Bill book created successfully');
                }
                if (onSaveSuccess && isModalOpen) {
                    onSaveSuccess();
                }
                getAllBillBooks();
            }
        } catch (error: any) {
            handleApiErrors(error); // Adjust error handling as needed
        } finally {
            dispatch(setLoading(false));
            setIsEditMode(false);
            setEditingBillBook(null);
            reset();
            setFocus('bookName'); // Adjust focus field as needed
        }
    };

    const handleEdit = (row: BillBookDto) => {


        setEditingBillBook(row);
        setIsEditMode(true);
        setValue('bookName', row.bookName);
        setValue('voucherType', row.voucherType);
        setValue('taxType', row.taxType);
        setValue('invoicePrefix', row.invoicePrefix);
        setValue('invoiceFormat', row.invoiceFormat);
        setValue('topHeader', row.topHeader);
        setValue('dealsIn', row.dealsIn);
        setValue('termsAndConditions1', row.termsAndConditions1);
        setValue('termsAndConditions2', row.termsAndConditions2);
        setValue('termsAndConditions3', row.termsAndConditions3);
        setValue('termsAndConditions4', row.termsAndConditions4);
        setValue('termsAndConditions5', row.termsAndConditions5);
        setFocus('bookName');
    };

    const handleDelete = async (row: BillBookDto) => {
        if (row.billBookId === undefined) {
            toast.error('Error: Invalid bill book ID');
            return;
        }
        if (window.confirm(`Are you sure you want to delete the bill book "${row.bookName}"?`)) {
            dispatch(setLoading(true));
            try {
                await agent.BillBook.deleteBillBook(accessId, row.billBookId);
                toast.success(`Bill book "${row.bookName}" deleted successfully`);
                getAllBillBooks();
            } catch (error) {
                console.error('Error deleting bill book:', error);
                toast.error('Error deleting bill book');
            } finally {
                dispatch(setLoading(false));
                setIsEditMode(false);
                setEditingBillBook(null);
                reset();
                setFocus('bookName');
            }
        }
    };

    return (
        <div className="sale-purchase-form">
            <CommonCard header="Bill Book" size="100%">
                <FormNavigator onSubmit={handleSubmit(onSubmit)} isModalOpen={isModalOpen}>
                    <Row className="g-3">
                        <Col md={5}>
                            <Row>
                                <Col xs={12}>
                                    <CustomInput
                                        autoFocus
                                        label="Book Name"
                                        name="bookName"
                                        register={register}
                                        validationRules={{ required: 'Book Name is required.' }}
                                        error={errors.bookName}
                                        maxLength={20}
                                    />
                                </Col>
                                <Col xs={12}>
                                    <CustomDropdown
                                        label="Tax Type"
                                        name="taxType"
                                        error={errors.taxType}
                                        options={TAX_TYPES_OPTIONS}
                                        control={control}

                                    />
                                </Col>
                                <Col xs={12}>
                                    <CustomDropdown
                                        label="Invoice Print Format"
                                        name="invoiceFormat"
                                        error={errors.invoiceFormat}
                                        options={INVOICE_PRINT_OPTIONS}
                                        control={control}
                                    />
                                </Col>
                                <Col xs={12}>
                                    <CustomInput
                                        label="Invoice Number Prefix"
                                        name="invoicePrefix"
                                        register={register}
                                        error={errors.invoicePrefix}
                                    />

                                </Col>

                                <Col xs={12}>
                                    <CustomInput
                                        label="Top Header"
                                        name="topHeader"
                                        register={register}
                                        maxLength={100}
                                    />
                                </Col>

                            </Row>
                        </Col>
                        <Col md={7}>

                            <Row>
                                <Col xs={12}>
                                    <CustomInput
                                        label="Deals In"
                                        name="dealsIn"
                                        register={register}
                                        maxLength={100}
                                    />
                                </Col>

                                {Array.from({ length: 5 }, (_, index) => (
                                    <Col xs={12} key={index}>
                                        <CustomInput
                                            label={`Terms and Conditions ${index + 1}`}
                                            name={`termsAndConditions${index + 1}`}
                                            register={register}
                                            maxLength={300}
                                        />
                                    </Col>
                                ))}

                            </Row>
                        </Col>

                    </Row>

                    <div className="mt-2 mb-2">

                        <CustomButton
                            text={isEditMode ? 'Update' : 'Save'}
                            variant="primary"
                            type="submit"
                            isSubmitting={isSubmitting}
                            showAtEnd

                        />
                    </div>

                </FormNavigator>
                <CommonTable
                    data={billBooks}
                    columns={columns}
                    onEdit={(row) => handleEdit(row)}
                    onDelete={(row) => handleDelete(row)}
                />
            </CommonCard>
        </div>
    )
}

export default SaleBillBookForm;
