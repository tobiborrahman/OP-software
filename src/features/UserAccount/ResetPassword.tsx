import { useForm } from 'react-hook-form';
import { Row, Col } from 'react-bootstrap';
import CustomInput from '../../app/components/CustomInput';
import { CustomButton, CommonCard, FormNavigator } from '../../app/components/Components';
import agent from '../../app/api/agent';
import toast from 'react-hot-toast';
import { useLocation, useNavigate } from 'react-router-dom';

function ResetPassword() {

    function useQuery() {
        const { search } = useLocation();
        return new URLSearchParams(search);
    }

    const query = useQuery();
    const userId = query.get('userId');
    const token = query.get('token');
    const navigate = useNavigate();
    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();

    const onSubmit = async (data: any) => {
        if (data.newPassword !== data.confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }

        try {
            const payload = {
                UserId: userId,
                Token: token,
                NewPassword: data.newPassword
            };

            await agent.UserAccount.resetPassword(payload);
            toast.success("Password reset successfully");
            navigate('/login');
        } catch (error) {
            toast.error("An error occurred while resetting the password");
            // Handle API errors here
        }
    };

    return (

        <CommonCard header="Reset Password">
            <FormNavigator onSubmit={handleSubmit(onSubmit)}>
                <CustomInput
                    label="New Password"
                    name="newPassword"
                    type="password"
                    placeholder="Enter new password"
                    register={register}
                    validationRules={{ required: "New Password is required" }}
                    error={errors.newPassword}
                />
                <CustomInput
                    label="Confirm New Password"
                    name="confirmPassword"
                    type="password"
                    placeholder="Confirm new password"
                    register={register}
                    validationRules={{ required: "Confirm Password is required" }}
                    error={errors.confirmPassword}
                />
                <Row>
                    <Col className="text-center">
                        <CustomButton type="submit" variant="success" isSubmitting={isSubmitting}
                            text="Reset Password"
                        />
                    </Col>
                </Row>
            </FormNavigator>

        </CommonCard >
    );
}

export default ResetPassword;
