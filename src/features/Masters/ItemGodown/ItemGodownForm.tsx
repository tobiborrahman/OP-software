import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { ColumnDef } from "@tanstack/react-table";
import { Col, Row } from "react-bootstrap";
import agent from "../../../app/api/agent";
import handleApiErrors from "../../../app/errors/handleApiErrors";
import { setLoading } from "../../../app/layout/loadingSlice";
import { useAppDispatch } from "../../../app/store/configureStore";

import { CommonCard, CommonTable, CustomButton, CustomInput, FormNavigator } from "../../../app/components/Components";
import { getAccessIdOrRedirect } from "../Company/CompanyInformation";

function ItemGodownForm() {
    const { register, handleSubmit, setValue, setFocus, formState: { isSubmitting, isValid }, reset } = useForm<ItemGodownDto>();
    const accessId = getAccessIdOrRedirect();
    const dispatch = useAppDispatch();
    const [itemCompanies, setItemCompanies] = useState<ItemGodownDto[]>([]);
    const [isEditMode, setIsEditMode] = useState(false);
    const [editingItemGodown, setEditingItemGodown] = useState<ItemGodownDto | null>(null);

    const columns: ColumnDef<ItemGodownDto>[] = [
        {
            accessorFn: row => row.itemGodownName,
            id: 'itemGodownName',
            header: 'Company Name',
            cell: info => info.getValue(),
        },

    ];

    const getAllItemGodowns = async () => {
        dispatch(setLoading(true));
        try {
            const fetchedItemCompanies = await agent.ItemGodown.getAllItemGodowns(accessId);
            setItemCompanies(fetchedItemCompanies);
        } catch (error) {
            console.error("Error fetching item companies", error);
            toast.error("Error fetching item companies");
        } finally {
            dispatch(setLoading(false));
        }
    };

    useEffect(() => {
        getAllItemGodowns();
    }, [dispatch]);

    const onSubmit = async (data: ItemGodownDto) => {
        dispatch(setLoading(true));
        try {
            if (accessId) {
                if (editingItemGodown && editingItemGodown.itemGodownID !== undefined) {
                    await agent.ItemGodown.updateItemGodown(accessId, editingItemGodown.itemGodownID, data);
                    toast.success('Item Godown updated successfully');
                } else {
                    await agent.ItemGodown.createItemGodown(accessId, data);
                    toast.success('Item Godown created successfully');
                }
                getAllItemGodowns();
            }
        } catch (error: any) {
            handleApiErrors(error); // Make sure this is adapted to handle your API's error structure
        } finally {
            dispatch(setLoading(false));
            setIsEditMode(false);
            setEditingItemGodown(null);
            reset();
            setFocus('itemGodownName');
        }
    };

    const handleEdit = (row: ItemGodownDto) => {
        setEditingItemGodown(row);
        setIsEditMode(true);
        setValue('itemGodownName', row.itemGodownName);
        setValue('itemGodownID', row.itemGodownID);
        setFocus('itemGodownName');
    };

    const handleDelete = async (row: ItemGodownDto) => {
        if (row.itemGodownID === undefined) {
            toast.error('Error: Invalid item godown ID');
            return;
        }
        if (window.confirm(`Are you sure you want to delete the item godown "${row.itemGodownName}"?`)) {
            dispatch(setLoading(true));
            try {
                await agent.ItemGodown.deleteItemGodown(accessId, row.itemGodownID);
                toast.success(`Item Godown "${row.itemGodownName}" deleted successfully`);
                getAllItemGodowns();
            } catch (error) {
                console.error('Error deleting item godown:', error);
                toast.error('Error deleting item godown');
            } finally {
                dispatch(setLoading(false));
                setIsEditMode(false);
                setEditingItemGodown(null);
                reset();
                setFocus('itemGodownName');
            }
        }
    };

    return (
        <CommonCard header='Item Godown'>
            <FormNavigator onSubmit={handleSubmit(onSubmit)}>
                <Row>
                    <Col xs={10}>
                        <CustomInput
                            autoFocus
                            label="Item Godown Name"
                            name='itemGodownName'
                            register={register}
                            validationRules={{ required: 'Item ompany Name cannot be empty.' }}
                        />
                    </Col>
                    <Col xs={2} className="d-flex align-items-end mb-2">
                        <CustomButton
                            text={isEditMode ? 'Update' : 'Save'} variant="primary" type="submit"
                            isSubmitting={isSubmitting}
                            isValid={isValid}
                            showAtEnd
                        />
                    </Col>
                </Row>
            </FormNavigator>
            <CommonTable
                data={itemCompanies}
                columns={columns}
                onEdit={handleEdit}
                onDelete={handleDelete}
                showSrNo
            />
        </CommonCard>
    );
}

export default ItemGodownForm;
