import React, { useState } from 'react';
import { Modal, Row, Col, Form } from 'react-bootstrap';
import { CustomInput, FormNavigator } from '../../../app/components/Components';
import { TransportDetailDto } from './salePurchaseVoucherDto';
import { useForm } from 'react-hook-form';

interface TransportDetailsModalProps {
    show: boolean;
    onHide: () => void;
    onSave: (data: TransportDetailDto) => void;
    initialData: TransportDetailDto;


}

const TransportAndShippingDetailModal: React.FC<TransportDetailsModalProps> = ({ show,
    onHide,
    onSave,
    initialData }) => {
    const { register, reset } = useForm<TransportDetailDto>({
        defaultValues: initialData
    });
    const [formData, setFormData] = useState<TransportDetailDto>(initialData);

    React.useEffect(() => {
        reset(initialData);
    }, [initialData, reset]);

    const handleSaveAndClose = () => {
        onSave(formData);
        onHide();
    };

    const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter' || event.key == 'Tab') {
            event.preventDefault();
            handleSaveAndClose();
        }
    };

    return (
        <Modal show={show} onHide={handleSaveAndClose} size='lg'>
            <Modal.Header closeButton>
                <Modal.Title style={{ fontSize: '18px' }}>Transport & Shipping Details</Modal.Title>
            </Modal.Header>

            <Modal.Body>
                <FormNavigator isModalOpen={true}>
                    <Row>
                        <Col md={12} xs={12}>
                            <CustomInput label="Transporter Name" name="transporterName" register={register}
                                onChange={(e) => setFormData({ ...formData, transporterName: e.target.value })} />
                        </Col>
                        <Col md={6} xs={12}>
                            <CustomInput label="Vehicle Number" name="vehicleNumber" value={formData.vehicleNumber}
                                onChange={(e) => setFormData({ ...formData, vehicleNumber: e.target.value })} />
                        </Col>
                        <Col md={6} xs={12}>
                            <CustomInput label="Driver Name" name="driverName" value={formData.driverName}
                                onChange={(e) => setFormData({ ...formData, driverName: e.target.value })} />
                        </Col>
                        <Col md={6} xs={12}>
                            <CustomInput label="GR Number" name="grNo" value={formData.grNo}
                                onChange={(e) => setFormData({ ...formData, grNo: e.target.value })} />
                        </Col>
                        <Col md={6} xs={12}>
                            <CustomInput label="GR Date" name="grDate" value={formData.grDate}
                                onChange={(e) => setFormData({ ...formData, grDate: e.target.value })} />
                        </Col>
                    </Row>
                    <Form.Text className="text-muted" style={{ fontSize: '12px' }}>
                        <i>Note: If Shipping details are empty Billed to Account details will be mentioned on bill.</i>
                    </Form.Text>
                    <Row>
                        <Col md={12} xs={12}>
                            <CustomInput label="Complete Shipping Address" name="deliveryAddress" value={formData.deliveryAddress}
                                onChange={(e) => setFormData({ ...formData, deliveryAddress: e.target.value })} />
                        </Col>
                        <Col md={6} xs={12}>
                            <CustomInput label="Shipping Firm Name" name="firmName" value={formData.firmName}
                                onChange={(e) => setFormData({ ...formData, firmName: e.target.value })} />
                        </Col>
                        <Col md={6} xs={12}>
                            <CustomInput label="GST Number" name="gstNo" value={formData.gstNo}
                                onChange={(e) => setFormData({ ...formData, gstNo: e.target.value })} />
                        </Col>
                        <Col md={6} xs={12}>
                            <CustomInput label="Contact Person Name" name="contactPersonName" value={formData.contactPersonName}
                                onChange={(e) => setFormData({ ...formData, contactPersonName: e.target.value })} />
                        </Col>
                        <Col md={6} xs={12}>
                            <CustomInput label="Contact Person Mobile Number" name="contactPersonMobileNumber" value={formData.contactPersonMobileNumber}
                                onChange={(e) => setFormData({ ...formData, contactPersonMobileNumber: e.target.value })} />
                        </Col>
                        <Col md={12} xs={12}>
                            <CustomInput label="Broker Name" name="brokerName" value={formData.brokerName}
                                onChange={(e) => setFormData({ ...formData, brokerName: e.target.value })}
                                onKeyDown={handleKeyPress} />
                        </Col>
                    </Row>
                </FormNavigator>
            </Modal.Body>
        </Modal>
    );
};

export default TransportAndShippingDetailModal;
