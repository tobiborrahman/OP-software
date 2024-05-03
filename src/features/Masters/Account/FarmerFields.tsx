import { AccountDto } from './accountDto';
import { UseFormRegister } from 'react-hook-form';
import Row from 'react-bootstrap/esm/Row';
import Col from 'react-bootstrap/esm/Col';
import { CustomInput } from '../../../app/components/Components';


interface FarmerFieldsProps {
    register: UseFormRegister<AccountDto>;
    errors: {
        [key: string]: any;
    };

}


const FarmerFields = ({ register }: FarmerFieldsProps) => {
    return (
        <div className="Farmer">
            <Row>
                <Col md={4}>
                    <CustomInput
                        label="Father Name"
                        name="fatherName"
                        register={register}
                        maxLength={50}
                    />
                </Col>
                <Col md={4}>
                    <CustomInput
                        label="GrandFather Name"
                        name="grandFatherName"
                        register={register}
                        maxLength={50}
                    />
                </Col>

                <Col md={4}>
                    <CustomInput
                        label="Registered ID"
                        name="farmerRegisterID"
                        register={register}
                        maxLength={50}
                    />
                </Col>
            </Row>
            <Row>
                <Col md={4}>
                    <CustomInput
                        label="Farmer Owned Land"
                        name="farmerOwnLand"
                        register={register}
                        maxLength={50}
                    />
                </Col>

                <Col md={4}>
                    <CustomInput
                        label="Farmer Lease Land"
                        name="farmerLeaseLand"
                        register={register}
                        maxLength={50}
                    />
                </Col>

                <Col md={4}>
                    <CustomInput
                        label="Gaunter Name & Mobile"
                        name="farmerGaurnterName"
                        register={register}
                        maxLength={50}
                    />
                </Col>
            </Row>
            <Row>
                {/* <Col md={12}>
                    <CustomInput
                        label="Upload Documents Provided by Farmer for Verification"
                        name="farmerDocumentUrls"
                        register={register}
                        maxLength={50}
                        type="file"
                    />
                </Col> */}


            </Row>
        </div>
    )
}

export default FarmerFields
