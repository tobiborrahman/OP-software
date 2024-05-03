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
import ItemUnitDto from "./itemUnitDto";
import { getAccessIdOrRedirect } from "../Company/CompanyInformation";


function ItemUnitForm() {
    const accessId = getAccessIdOrRedirect();
    const { register, handleSubmit, setValue, setFocus, formState: { isSubmitting, isValid }, reset } = useForm<ItemUnitDto>();
    const dispatch = useAppDispatch();
    const [itemUnits, setItemUnits] = useState<ItemUnitDto[]>([]);
    const [isEditMode, setIsEditMode] = useState(false);
    const [editingUnit, setEditingUnit] = useState<ItemUnitDto | null>(null);

    const columns: ColumnDef<ItemUnitDto>[] = [
        {
            accessorFn: row => row.unitName,
            id: 'unitName',
            header: 'Unit Name',
            cell: info => info.getValue(),
        },
        {
            accessorFn: row => row.description,
            id: 'description',
            header: 'Description',
            cell: info => info.getValue(),
        }
    ];

    const getAllItemUnits = async () => {
        dispatch(setLoading(true));
        try {
            const fetchedUnits = await agent.ItemUnit.getAllItemUnits(accessId);
            setItemUnits(fetchedUnits);
        } catch (error) {
            console.error("Error fetching item units", error);
            toast.error("Error fetching item units");
        } finally {
            dispatch(setLoading(false));
        }
    };

    useEffect(() => {
        getAllItemUnits();
    }, [dispatch]);

    const onSubmit = async (data: ItemUnitDto) => {
        dispatch(setLoading(true));
        try {
            if (isEditMode && editingUnit && editingUnit.itemUnitID !== undefined) {
                await agent.ItemUnit.updateItemUnit(accessId, editingUnit.itemUnitID, data);
                toast.success('Item Unit updated successfully');
            } else {
                await agent.ItemUnit.createItemUnit(accessId, data);
                toast.success('Item Unit added successfully');
            }
            getAllItemUnits();
        } catch (error: any) {
            handleApiErrors(error);
        } finally {
            dispatch(setLoading(false));
            setIsEditMode(false);
            setEditingUnit(null);
            reset();
            setFocus('unitName');
        }
    };

    const handleEdit = (row: ItemUnitDto) => {
        setEditingUnit(row);
        setIsEditMode(true);
        setValue('unitName', row.unitName);
        setValue('description', row.description);
        setFocus('unitName');
    };

    const handleDelete = async (row: ItemUnitDto) => {
        if (row.itemUnitID === undefined) {
            toast.error('Error: Invalid Item Unit ID');
            return;
        }
        if (window.confirm(`Are you sure you want to delete the Item Unit "${row.unitName}"?`)) {
            dispatch(setLoading(true));
            try {
                await agent.ItemUnit.deleteItemUnit(accessId, row.itemUnitID);
                toast.success(`Item Unit "${row.unitName}" deleted successfully`);
                getAllItemUnits();
            } catch (error) {
                console.error('Error deleting item unit:', error);
                toast.error('Error deleting item unit');
            } finally {
                dispatch(setLoading(false));
                setIsEditMode(false);
                setEditingUnit(null);
                reset();
                setFocus('unitName');
            }
        }
    };

    return (
        <CommonCard header='Item Unit'>
            <FormNavigator onSubmit={handleSubmit(onSubmit)}>
                <Row>
                    <Col xs={12}>
                        <CustomInput
                            label="Unit Name"
                            name='unitName'
                            register={register}
                            validationRules={{ required: 'Unit Name cannot be empty.' }}
                        />
                    </Col>
                </Row>
                <Row>
                    <Col xs={12} md={10}>
                        <CustomInput
                            label="Description"
                            name='description'
                            register={register}
                            validationRules={{ required: 'Description cannot be empty.' }}
                        />
                    </Col>
                    <Col xs={12} md={2} className="d-flex align-items-end mb-3">
                        <CustomButton
                            text={isEditMode ? 'Update' : 'Save'} variant="primary" type="submit"
                            isSubmitting={isSubmitting}
                            isValid={isValid}

                        />
                    </Col>
                </Row>
            </FormNavigator>
            <CommonTable
                data={itemUnits}
                columns={columns}
                onEdit={handleEdit}
                onDelete={handleDelete}
                showSrNo
            />
        </CommonCard>
    );
}

export default ItemUnitForm;
