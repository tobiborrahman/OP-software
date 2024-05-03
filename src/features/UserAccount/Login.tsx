import { useForm } from 'react-hook-form';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../../app/store/configureStore';
import { signInUser } from './accountSlice';
import { Col, Form, FormGroup, Row } from 'react-bootstrap';
import CustomInput from '../../app/components/CustomInput';
import {
	CustomButton,
	CommonCard,
	FormNavigator,
} from '../../app/components/Components';

import loginImg from '../../assets/images/login-animated.svg';

function Login() {
	const dispatch = useAppDispatch();
	const location = useLocation();
	const navigate = useNavigate();
	const {
		register,
		handleSubmit,
		formState: { isSubmitting, errors, isValid },
	} = useForm({ mode: 'all' });

	async function submitForm(data: any) {
		try {
			const actionResult = await dispatch(signInUser(data));
			if (signInUser.fulfilled.match(actionResult)) {
				navigate(location.state?.from?.pathname || '/select-company');
			}
		} catch (error) {
			console.error(error);
		}
	}

	return (
		// <div className="container-fluid vh-100 centered-card">
		// 	<CommonCard header="Login" size="35%" className="">
		// 		<div className="row p-5">
		// 			<form className="col-6">
		// 				<FormNavigator onSubmit={handleSubmit(submitForm)}>
		// 					<CustomInput
		// 						label="Email address"
		// 						name="email"
		// 						type="email"
		// 						autoFocus
		// 						register={register}
		// 						validationRules={{
		// 							required: 'Email is required',
		// 						}}
		// 						error={errors.email}
		// 						autoComplete="on"
		// 						className="input-box"
		// 					/>
		// 					<CustomInput
		// 						label="Password"
		// 						name="password"
		// 						type="password"
		// 						register={register}
		// 						className="w-100"
		// 						validationRules={{
		// 							required: 'Password is required',
		// 						}}
		// 						error={errors.password}
		// 						autoComplete="on"
		// 					/>
		// 					<FormGroup className="pt-3">
		// 						<Form.Check
		// 							inline
		// 							type="checkbox"
		// 							id="rememberMeCheckbox"
		// 							label="Remember me?"
		// 							{...register('rememberMe')}
		// 						/>
		// 					</FormGroup>
		// 					{/* <Row>
		// 						<Col md={6}>
		// 							<FormGroup>
		// 								<Form.Check
		// 									inline
		// 									type="checkbox"
		// 									id="rememberMeCheckbox"
		// 									label="Remember me?"
		// 									{...register('rememberMe')}
		// 								/>
		// 							</FormGroup>
		// 						</Col>
		// 						<Col md={6}>
		// 							<FormGroup className="text-left w-full">
		// 								<CustomButton
		// 									type="submit"
		// 									variant="success"
		// 									isSubmitting={isSubmitting}
		// 									text="Login"
		// 									isValid={isValid}
		// 									showAtEnd
		// 								/>
		// 							</FormGroup>
		// 						</Col>
		// 					</Row> */}

		// 					{/* Forgot Password and Resend Email Confirmation */}
		// 				</FormNavigator>
		// 				<div className="row pb-3">
		// 					<Link
		// 						to="/forgot-password"
		// 						className="col-6 d-block"
		// 					>
		// 						Forgot your password?
		// 					</Link>
		// 					<Link
		// 						to="/resend-confirmation"
		// 						className="col-6 d-block text-end"
		// 					>
		// 						Resend email confirmation
		// 					</Link>
		// 				</div>

		// 				<FormGroup className="text-center">
		// 					<CustomButton
		// 						style={{ width: '100%' }}
		// 						size="lg"
		// 						type="submit"
		// 						variant="success"
		// 						isSubmitting={isSubmitting}
		// 						text="Login"
		// 						isValid={isValid}
		// 						showAtEnd
		// 					/>
		// 				</FormGroup>

		// 				{/* Register Prompt */}
		// 				<div className="text-center mt-4">
		// 					Not yet registered?{' '}
		// 					<Link to="/register">
		// 						<strong>Click here to register now</strong>
		// 					</Link>
		// 				</div>
		// 			</form>

		// 			<div className="col-6 ps-5">
		// 				<img className="login-img" src={loginImg} alt="" />
		// 			</div>
		// 		</div>
		// 	</CommonCard>
		// </div>

		<div className="container-fluid vh-100 d-flex justify-content-center align-items-center login-card-container">
			<CommonCard header="Login" size="35%">
				<Row className="row p-3 p-md-5">
					<Col className="col-md-6">
						<FormNavigator onSubmit={handleSubmit(submitForm)}>
							<CustomInput
								label="Email address"
								name="email"
								type="email"
								autoFocus
								register={register}
								validationRules={{
									required: 'Email is required',
								}}
								error={errors.email}
								autoComplete="on"
								className="input-box"
							/>
							<CustomInput
								label="Password"
								name="password"
								type="password"
								register={register}
								className="w-100"
								validationRules={{
									required: 'Password is required',
								}}
								error={errors.password}
								autoComplete="on"
							/>
							<FormGroup className="pt-3">
								<Form.Check
									inline
									type="checkbox"
									id="rememberMeCheckbox"
									label="Remember me?"
									{...register('rememberMe')}
								/>
							</FormGroup>
							<Row className="row pb-3">
								<Col className="col-12 pb-1">
									<Link
										to="/forgot-password"
										className="d-block"
									>
										Forgot your password?
									</Link>
								</Col>
								<Col className="col-12">
									{' '}
									{/* Align text to right on desktop */}
									<Link
										to="/resend-confirmation"
										className="d-block"
									>
										Resend email confirmation
									</Link>
								</Col>
							</Row>
							<FormGroup className="text-center">
								<CustomButton
									style={{ width: '100%' }}
									size="lg"
									type="submit"
									variant="success"
									isSubmitting={isSubmitting}
									text="Login"
									isValid={isValid}
									showAtEnd
								/>
							</FormGroup>
							<div className="text-center mt-4">
								Not yet registered?{' '}
								<Link to="/register">
									<strong>Click here to register now</strong>
								</Link>
							</div>
						</FormNavigator>
					</Col>
					<Col className="col-md-6 text-center">
						<img className="login-img" src={loginImg} alt="" />
					</Col>
				</Row>
			</CommonCard>
		</div>
	);
}

export default Login;
