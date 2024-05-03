import React, { useEffect, useState } from 'react';
import { Modal, Row, Col } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { CustomInput, FormNavigator } from '../../../app/components/Components';
import { CustomerDetailDto } from './salePurchaseVoucherDto';


interface CustomerDetailModalProps {
    show: boolean;
    onHide: () => void;
    onSave: (data: CustomerDetailDto) => void;
    initialData: CustomerDetailDto;
}

const CustomerDetailModal: React.FC<CustomerDetailModalProps> = ({ show, onHide, onSave, initialData }) => {
    const { register, reset } = useForm<CustomerDetailDto>({
        defaultValues: initialData
    });

    const [formData, setFormData] = useState<CustomerDetailDto>(initialData);

    useEffect(() => {
        reset(initialData);
    }, [initialData, reset]);

    const handleSaveAndClose = () => {
        onSave(formData);
        onHide();
    };

    const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter' || event.key === 'Tab') {
            event.preventDefault();
            handleSaveAndClose();
        }
    };

    return (
        <Modal show={show} onHide={handleSaveAndClose} size="lg">
            <Modal.Header closeButton>
                <Modal.Title>Customer Details</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <FormNavigator isModalOpen={true}>
                    <Row>
                        <Col md={6} xs={12}>
                            <CustomInput label="Customer Name" name="customerName" register={register}
                                onChange={(e) => setFormData({ ...formData, customerName: e.target.value })} />
                        </Col>
                        <Col md={6} xs={12}>
                            <CustomInput label="Customer Contact No" name="customerContactNo" register={register}
                                onChange={(e) => setFormData({ ...formData, customerContactNo: e.target.value })} />
                        </Col>
                        <Col md={6} xs={12}>
                            <CustomInput label="Customer Address" name="customerAddress" register={register}
                                onChange={(e) => setFormData({ ...formData, customerAddress: e.target.value })} />
                        </Col>
                        <Col md={6} xs={12}>
                            <CustomInput label="Customer GST No" name="customerGSTNo" register={register}
                                onChange={(e) => setFormData({ ...formData, customerGSTNo: e.target.value })} />
                        </Col>
                        <Col md={6} xs={12}>
                            <CustomInput label="Customer PAN" name="customerPAN" register={register}
                                onChange={(e) => setFormData({ ...formData, customerPAN: e.target.value })} />
                        </Col>
                        <Col md={6} xs={12}>
                            <CustomInput label="Customer Aadhar" name="customerAadhar" register={register}
                                onChange={(e) => setFormData({ ...formData, customerAadhar: e.target.value })}
                                onKeyDown={handleKeyPress} />
                        </Col>
                    </Row>
                </FormNavigator>
            </Modal.Body>
        </Modal>
    );
};

export default CustomerDetailModal;
