import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import agent from '../../app/api/agent';
import CustomInput from '../../app/components/CustomInput';
import CustomButton from '../../app/components/CustomButton';
import FormNavigator from '../../app/components/FormNavigator';
import CommonCard from '../../app/components/CommonCard';
import loginImg from '../../assets/images/login-animated.svg';
import { Col, Container, Image, Row } from 'react-bootstrap';

function Register() {
	const navigate = useNavigate();

	const {
		register,
		handleSubmit,
		setError,
		watch,
		formState: { isSubmitting, errors, isValid },
	} = useForm({
		mode: 'onSubmit',
	});

	function handleApiErrors(apiErrors: any) {
		if (apiErrors) {
			apiErrors.forEach((error: string) => {
				toast.error(error);
				if (error.includes('Password')) {
					setError('password', { type: 'manual', message: error });
				} else if (error.includes('Email') || error.includes('User')) {
					setError('email', { type: 'manual', message: error });
				} else if (error.includes('ConfirmPassword')) {
					setError('confirmPassword', {
						type: 'manual',
						message: error,
					});
				}
			});
		}
	}

	async function onSubmit(data: any) {
		await agent.UserAccount.register(data)
			.then(() => {
				toast.success('Registration successful - you can now login');
				navigate('/login');
			})
			.catch((error) => handleApiErrors(error));
	}

	return (
		<Container className="container-fluid vh-100 d-flex justify-content-center align-items-center register-card-container">
			<CommonCard header="Register" size="40%">
				<Row className="row ps-4 p-md-5 card-register">
					<Col className="col-md-6">
						<FormNavigator onSubmit={handleSubmit(onSubmit)}>
							<CustomInput
								autoFocus
								type="text"
								label="Full Name"
								name="fullName"
								register={register}
								validationRules={{
									required: 'Full name is required',
								}}
								error={errors.fullName}
							/>
							<CustomInput
								type="email"
								label="Email"
								name="email"
								register={register}
								validationRules={{
									required: 'Email is required',
								}}
								error={errors.email}
							/>
							<CustomInput
								type="text"
								label="Phone Number"
								name="phoneNumber"
								register={register}
								validationRules={{
									required: 'Phone number is required',
								}}
								error={errors.phoneNumber}
							/>
							<CustomInput
								type="password"
								label="Password"
								name="password"
								register={register}
								validationRules={{
									required: 'Password is required',
									pattern: {
										value: /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/,
										message:
											'Password does not meet complexity requirements',
									},
								}}
								error={errors?.password}
							/>
							<CustomInput
								type="password"
								label="Confirm Password"
								name="confirmPassword"
								register={register}
								validationRules={{
									required: 'Confirm password is required',
									validate: (value: string) =>
										value === watch('password') ||
										'Passwords do not match',
								}}
								error={errors.confirmPassword}
							/>

							<div className="d-flex align-items-center py-3">
								<input
									type="checkbox"
									id="termsAndConditions"
									name="termsAndConditions"
								/>
								<label
									htmlFor="termsAndConditions"
									className="ms-2"
								>
									Agree to{' '}
									<a href="/terms">Terms and Conditions</a>
								</label>
							</div>
							<CustomButton
								className="w-100"
								type="submit"
								variant="success"
								isSubmitting={isSubmitting}
								isValid={isValid}
								text="Register"
								showAtEnd
							/>
						</FormNavigator>
						<div className="text-center mt-4">
							<Link to="/login">
								<strong>Already a user? Login</strong>
							</Link>
						</div>
					</Col>
					<Col className="col-md-6 text-center">
						<Image className="register-img" src={loginImg} alt="" />
					</Col>
				</Row>
			</CommonCard>
		</Container>
	);
}

export default Register;
