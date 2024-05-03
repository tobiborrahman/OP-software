import { useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import toast from "react-hot-toast";
import { Row, Col, Form } from "react-bootstrap";
import { ControlOptionDto } from "./controlOptionDto";
import agent from "../../../app/api/agent";
import { VoucherTypeEnum, getVoucherTypeString } from "./voucherTypeEnum";
import FormNavigator from "../../../app/components/FormNavigator";
import CommonCard from "../../../app/components/CommonCard";
import CustomButton from "../../../app/components/CustomButton";
import { getAccessIdOrRedirect } from "../../Masters/Company/CompanyInformation";


interface FormValues {
    controlOptions: ControlOptionDto[];
}
interface ControlPanelFormProps {
    voucherType?: VoucherTypeEnum;
    onSaveSuccess?: () => void;
    isModalOpen?: boolean;
}


function ControlPanelForm({ voucherType, onSaveSuccess, isModalOpen }: ControlPanelFormProps) {
    const accessId = getAccessIdOrRedirect();
    const { control, register, handleSubmit, formState: { isSubmitting } } = useForm<FormValues>({
        defaultValues: {
            controlOptions: [],
        },
    });
    const { fields, append, remove } = useFieldArray({
        control,
        name: "controlOptions",
    });

    if (!voucherType) {
        toast.error("Voucher type is undefined.");
        return null;
    }

    useEffect(() => {
        const fetchControlOptions = async () => {
            try {
                const fetchedOptions = await agent.ControlOptions.list(accessId, voucherType);
                remove();
                fetchedOptions.forEach(option => append(option));
            } catch (error) {
                toast.error("Failed to load control options.");
            }
            finally {
            }
        };
        fetchControlOptions();
    }, [accessId, append]);


    const onSubmit = async (data: FormValues) => {
        try {
            await agent.ControlOptions.UpdateControlOptions(accessId, voucherType, data.controlOptions);
            toast.success("Control options updated successfully.");
            if (onSaveSuccess) {
                onSaveSuccess();
            }
        } catch (error) {
            toast.error("Failed to update control options.");
        }
        finally {

        }
    };

    return (
        <FormNavigator onSubmit={handleSubmit(onSubmit)} isModalOpen={isModalOpen}>
            <CommonCard header={`Control Panel ${getVoucherTypeString(voucherType)}`} >
                {fields.map((field, index) => (
                    <Row key={field.id} className="mb-1">
                        <Col sm={1}>
                            <Form.Label>{index + 1}</Form.Label>
                        </Col>
                        <Col sm={8} >
                            <Form.Label>{field.controlOption}</Form.Label>
                        </Col>
                        <Col sm={3}>
                            {field.controlValue === "Y" || field.controlValue === "N" ? (
                                <Form.Select {...register(`controlOptions.${index}.controlValue` as const)} defaultValue={field.controlValue}>
                                    <option value="Y">Y</option>
                                    <option value="N">N</option>
                                </Form.Select>
                            ) : (
                                <Form.Control
                                    type="text"
                                    {...register(`controlOptions.${index}.controlValue` as const)}
                                    defaultValue={field.controlValue}
                                />
                            )}
                        </Col>
                    </Row>
                ))}
                <Row>
                    <CustomButton showAtEnd={true} type="submit" variant="primary" isSubmitting={isSubmitting} text="Apply Changes" className="mt-3" />
                </Row>
            </CommonCard>
        </FormNavigator>

    );
}

export default ControlPanelForm;
