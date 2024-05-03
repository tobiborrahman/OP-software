import { AccountGroupDto } from "./accountGroupDto";
import { CommonCard, CommonTable, CustomButton, CustomInput, FormNavigator, CustomDropdown } from "../../../app/components/Components";
import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import agent from "../../../app/api/agent";
import { setLoading, setTableLoading } from "../../../app/layout/loadingSlice";
import { useAppDispatch } from "../../../app/store/configureStore";
import toast from "react-hot-toast";
import handleApiErrors from "../../../app/errors/handleApiErrors";
import { ColumnDef } from "@tanstack/react-table";
import { Col, Row } from "react-bootstrap";
import { getAccessIdOrRedirect } from "../Company/CompanyInformation";


function AccountGroupForm() {

    const accessId = getAccessIdOrRedirect();
    const { register, handleSubmit, setValue, control, setFocus, formState: { errors, isSubmitting }, reset } = useForm<AccountGroupDto>();
    const [underGroups, setUnderGroups] = useState<any>([]);
    const dispatch = useAppDispatch();
    const [accountGroups, setAccountGroups] = useState<AccountGroupDto[]>([]);
    const [isEditMode, setIsEditMode] = useState(false);
    const [editingGroup, setEditingGroup] = useState<AccountGroupDto | null>(null);

    const columns: ColumnDef<AccountGroupDto>[] = [
        {
            accessorFn: row => row.groupName,
            id: 'groupName',
            header: 'Group Name',
            cell: info => info.getValue(),

        },
        {
            accessorFn: row => row.underGroup,
            id: 'underGroup',
            header: 'Under Group',
            cell: info => info.getValue(),
        }
    ];

    const getAllAccountGroups = async () => {
        dispatch(setTableLoading(true));
        try {
            const fetchedGroups = await agent.AccountGroup.getAllAccountGroups(accessId);
            setAccountGroups(fetchedGroups);
        } catch (error) {
            console.error("Error fetching account groups", error);
            toast.error("Error fetching account groups");
        } finally {
            dispatch(setTableLoading(false));
        }
    };

    useEffect(() => {
        getAllAccountGroups();
    }, [dispatch]);


    useEffect(() => {
        const getUnderGroup = async () => {
            try {
                const underGroups = await agent.AccountGroup.getAllUnderGroups(accessId);
                const formattedUnderGroups = underGroups.map((underGroup: any) => ({
                    label: underGroup.underGroupName,
                    value: underGroup.underGroupID
                }));
                setUnderGroups(formattedUnderGroups);
            } catch (error) {
                console.error("Error fetching under groups:", error);
            }
        };

        getUnderGroup();
    }, [accessId]);

    const onSubmit = async (data: AccountGroupDto) => {
        dispatch(setLoading(true));
        try {
            if (accessId) {
                if (editingGroup && editingGroup.groupID !== undefined) {
                    await agent.AccountGroup.update(accessId, editingGroup?.groupID, data)
                    toast.success('Account group updated successfully');
                }
                else {
                    await agent.AccountGroup.create(accessId, data);
                    toast.success('Account group created successfully');
                }
                getAllAccountGroups();
            }
        } catch (error: any) {
            handleApiErrors(errors);
        } finally {
            dispatch(setLoading(false));
            setIsEditMode(false);
            setEditingGroup(null);
            reset();
            setFocus('groupName');
        }
    };

    const handleEdit = (row: AccountGroupDto) => {
        setEditingGroup(row);
        setIsEditMode(true);
        setValue('groupName', row.groupName);
        setValue('underGroupID', row.underGroupID);
        setValue('groupID', row.groupID)
        setFocus('groupName');

    };


    const handleDelete = async (row: AccountGroupDto) => {
        if (row.groupID === undefined) {
            toast.error('Error: Invalid group ID');
            return;
        }
        if (window.confirm(`Are you sure you want to delete the group "${row.groupName}"?`)) {
            dispatch(setLoading(true));
            try {
                await agent.AccountGroup.delete(accessId, row.groupID);
                toast.success(`Group "${row.groupName}" deleted successfully`);
                getAllAccountGroups(); // Refresh the list after deletion
            } catch (error) {
                console.error('Error deleting account group:', error);
                toast.error('Error deleting account group');
            } finally {
                dispatch(setLoading(false));
                setIsEditMode(false);
                setEditingGroup(null);
                reset();
                setFocus('groupName');

            }
        }
    };

    return (
        <CommonCard header='Account Group' size="50%">
            <FormNavigator onSubmit={handleSubmit(onSubmit)}>
                <Row>

                    <Col xs={12}>
                        <CustomInput
                            autoFocus
                            label="Group Name"
                            name='groupName'
                            register={register}
                            validationRules={{ required: 'Account Group Name cannot be empty.' }}
                        />
                    </Col>
                </Row>
                <Row>
                    <Col xs={12} md={10}>
                        <CustomDropdown
                            name="underGroupID"
                            label="Under Group"
                            options={underGroups}
                            control={control}
                            error={errors.underGroupID}
                            validationRules={{ required: "State is required" }}
                        />
                    </Col>

                    <Col xs={12} md={2} className="d-flex align-items-end mb-3">
                        <CustomButton
                            text={isEditMode ? 'Update' : 'Save'} type="submit"
                            isSubmitting={isSubmitting}
                            showAtEnd
                        />
                    </Col>
                </Row>
            </FormNavigator>
            <CommonTable
                data={accountGroups}
                columns={columns}
                onEdit={(row) => handleEdit(row)}
                onDelete={(row) => handleDelete(row)}
                showSrNo
            />
        </CommonCard>
    )
}

export default AccountGroupForm;