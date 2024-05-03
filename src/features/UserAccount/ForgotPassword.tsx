
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { Col, Container, Row } from 'react-bootstrap';
import CustomInput from '../../app/components/CustomInput';
import { CustomButton, CommonCard, FormNavigator } from '../../app/components/Components';
import agent from '../../app/api/agent';
import toast from 'react-hot-toast';
import handleApiErrors from '../../app/errors/handleApiErrors';

function ForgotPassword() {
    const {
        register,
        handleSubmit,
        formState: { isSubmitting, errors },
    } = useForm({ mode: 'onSubmit' });
    const navigate = useNavigate();


    async function onSubmit(data: object) {
        try {
            await agent.UserAccount.forgotPassword(data)
                .then(() => {
                    toast.success("Email sent successfully");
                    navigate("/select-company");
                });
        }
        catch (error) {
            handleApiErrors(error);
        }

    }

    return (
        <Container className="mt-4">
            <Row className="justify-content-center">
                <Col md={6} lg={5}>
                    <CommonCard header="Forgot Password">
                        <FormNavigator onSubmit={handleSubmit(onSubmit)}>
                            <CustomInput
                                label="Email address"
                                name="email"
                                type="email"
                                placeholder="Enter your email"
                                autoFocus
                                register={register}
                                validationRules={{ required: "Email is required" }}
                                error={errors.email}
                            />
                            <Row>
                                <Col className="text-center">
                                    <CustomButton type="submit" variant="success" isSubmitting={isSubmitting} text='Send Email' />
                                </Col>
                            </Row>
                        </FormNavigator>
                        <div className="text-left">
                            An email will be sent to your address with instructions to reset your password.
                        </div>

                        {/* Back to Login Button */}

                        <div className="text-center mt-4">
                            <Link to="/login"><strong> Back to Login</strong></Link>
                        </div>

                    </CommonCard>
                </Col>
            </Row>
        </Container >
    );
}

export default ForgotPassword;
