import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import agent from "../../../app/api/agent";
import { setLoading } from "../../../app/layout/loadingSlice";
import { useAppDispatch } from "../../../app/store/configureStore";
import toast from "react-hot-toast";
import handleApiErrors from "../../../app/errors/handleApiErrors";
import { ColumnDef } from "@tanstack/react-table";
import { Col, Row } from "react-bootstrap";
import { CommonCard, CommonTable, CustomButton, CustomInput, FormNavigator } from "../../../app/components/Components";
import GSTSlabDto from "./gstSlabDto";
import { convertNullOrEmptyToZero } from "../../../app/utils/numberUtils";
import { getAccessIdOrRedirect } from "../Company/CompanyInformation";

function GSTSlabForm() {
    const { register, handleSubmit, setValue, setFocus, watch, formState: { isSubmitting, isValid }, reset } = useForm<GSTSlabDto>();
    const accessId = getAccessIdOrRedirect();
    const dispatch = useAppDispatch();
    const [gstSlabs, setGSTSlabs] = useState<GSTSlabDto[]>([]);
    const [isEditMode, setIsEditMode] = useState(false);
    const [editingGSTSlab, setEditingGSTSlab] = useState<GSTSlabDto | null>(null);

    const columns: ColumnDef<GSTSlabDto>[] = [
        {
            accessorFn: row => row.gstSlabName,
            id: 'gstSlabName',
            header: 'GST Slab Name',
            cell: info => info.getValue(),
        },
        {
            accessorFn: row => row.sgst,
            id: 'sgst',
            header: 'SGST (%)',
            cell: info => info.getValue() ?? '',
        },
        {
            accessorFn: row => row.cgst,
            id: 'cgst',
            header: 'CGST (%)',
            cell: info => info.getValue() ?? '',
        },
        {
            accessorFn: row => row.igst,
            id: 'igst',
            header: 'IGST (%)',
            cell: info => info.getValue() ?? '',
        },


    ];
    const getAllGSTSlabs = async () => {
        dispatch(setLoading(true));
        try {
            const fetchedGSTSlabs = await agent.GSTSlab.getAllGSTSlabs(accessId);
            setGSTSlabs(fetchedGSTSlabs);
        } catch (error) {
            toast.error("Error fetching GST Slabs");
        } finally {
            dispatch(setLoading(false));
        }
    };

    useEffect(() => {
        getAllGSTSlabs();
    }, [dispatch]);


    const onSubmit = async (data: GSTSlabDto) => {
        dispatch(setLoading(true));
        const numericFields: (keyof GSTSlabDto)[] = ['sgst', 'cgst', 'igst', 'additionalTax', 'composition', 'cess'];        // Process the data
        const processedData = convertNullOrEmptyToZero(data, numericFields);
        try {
            if (isEditMode && editingGSTSlab && editingGSTSlab.gstSlabID !== undefined) {
                await agent.GSTSlab.updateGSTSlab(accessId, editingGSTSlab.gstSlabID, processedData);
                toast.success('GST Slab updated successfully');
            } else {
                await agent.GSTSlab.createGSTSlab(accessId, processedData);
                toast.success('GST Slab added successfully');
            }
            reset();
            setIsEditMode(false);
            setEditingGSTSlab(null);
            getAllGSTSlabs();
        } catch (error) {
            handleApiErrors(error);
        } finally {
            dispatch(setLoading(false));
        }
    };

    const handleEdit = (row: GSTSlabDto) => {
        setEditingGSTSlab(row);
        setIsEditMode(true);
        // Set values for all the fields
        setValue('gstSlabName', row.gstSlabName);
        setValue('sgst', row.sgst);
        setValue('cgst', row.cgst);
        setValue('igst', row.igst);
        setValue('additionalTax', row.additionalTax);
        setValue('composition', row.composition);
        setValue('cess', row.cess);
        // Focus on the first field
        setFocus('gstSlabName');
    };

    const handleDelete = async (row: GSTSlabDto) => {
        if (row.gstSlabID === undefined) {
            toast.error('Error: Invalid GST Slab ID');
            return;
        }
        if (window.confirm(`Are you sure you want to delete the GST Slab "${row.gstSlabName}"?`)) {
            dispatch(setLoading(true));
            try {
                await agent.GSTSlab.deleteGSTSlab(accessId, row.gstSlabID);
                toast.success(`GST Slab "${row.gstSlabName}" deleted successfully`);
                getAllGSTSlabs();
            } catch (error) {
                toast.error('Error deleting GST Slab');
            } finally {
                reset();
                setIsEditMode(false);
                setEditingGSTSlab(null);
                dispatch(setLoading(false));

            }
        }
    };

    // Watch the IGST value
    const igstValue = watch("igst");

    // Automatically divide IGST into SGST and CGST
    useEffect(() => {
        const halfIgst: number = igstValue ? igstValue / 2 : 0;
        setValue("sgst", halfIgst);
        setValue("cgst", halfIgst);
    }, [igstValue, setValue]);

    return (
        <CommonCard header='GST Slab' size="75%">
            <FormNavigator onSubmit={handleSubmit(onSubmit)}>
                <Row>
                    <Col xs={12}>
                        <CustomInput
                            label="GST Slab Name"
                            name='gstSlabName'
                            register={register}
                            validationRules={{ required: 'GST Slab Name cannot be empty.' }}
                        />
                    </Col>
                </Row>
                <Row>
                    <Col xs={4}>
                        <CustomInput
                            label="IGST (%)"
                            name='igst'
                            type="number"
                            register={register}
                            validationRules={{ required: 'IGST is required.' }}
                            allowedChars="numericDecimal"
                        />
                    </Col>
                    <Col xs={4}>
                        <CustomInput
                            label="SGST (%)"
                            name='sgst'
                            type="number"
                            register={register}
                            validationRules={{ required: 'SGST is required.' }}
                            allowedChars="numericDecimal"

                        />
                    </Col>
                    <Col xs={4}>
                        <CustomInput
                            label="CGST (%)"
                            name='cgst'
                            type="number"
                            register={register}
                            validationRules={{ required: 'CGST is required.' }}
                            allowedChars="numericDecimal"
                        />
                    </Col>

                </Row>
                <Row>
                    <Col xs={4}>
                        <CustomInput
                            label="Additional Tax (%)"
                            name='additionalTax'
                            type="number"
                            register={register}
                            allowedChars="numericDecimal"

                        />
                    </Col>
                    <Col xs={4}>
                        <CustomInput
                            label="Composition (%)"
                            name='composition'
                            type="number"
                            register={register}
                            allowedChars="numericDecimal"
                        />
                    </Col>
                    <Col xs={4}>
                        <CustomInput
                            label="Cess (%)"
                            name='cess'
                            type="number"
                            register={register}
                            allowedChars="numericDecimal"
                        />
                    </Col>
                </Row>
                <Row>
                    <Col xs={12} className="d-flex align-items-end justify-content-end mb-2">
                        <CustomButton text={isEditMode ? 'Update' : 'Save'} variant="primary" type="submit" isSubmitting={isSubmitting} isValid={isValid} />
                    </Col>
                </Row>
            </FormNavigator>

            <CommonTable
                data={gstSlabs}
                columns={columns}
                onEdit={handleEdit}
                onDelete={handleDelete}
            />
        </CommonCard>
    );
}

export default GSTSlabForm;
