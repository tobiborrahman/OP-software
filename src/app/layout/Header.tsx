import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import logo from '../../assets/images/logo.png';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '../store/configureStore';
import CustomButton from '../components/CustomButton';
import RightSignInUserMenu from './SignedInMenu';
import './Header.scss'; // Ensure this file contains the updated CSS
import CompanyHeader from './CompanyHeader';
import {
	deleteStoredCompanyInformation,
	getAccessId,
} from '../../features/Masters/Company/CompanyInformation';

function Header() {
	const { user } = useAppSelector((state) => state.account);
	const navigate = useNavigate();
	const accessId = getAccessId();
	const navigateTo = (path: any) => navigate(path);
	const isCompanyUser = user && accessId;
	// const logoLink = isCompanyUser ? '/dashboard' : (user ? '/select-company' : '/');

	const guestLinks = (
		<Nav className="container-fluid me-auto">
			<Nav.Item>
				<Navbar.Brand as={Link} to="/">
					<img
						src={logo}
						width="35"
						height="35"
						alt="Logo"
						className="logo"
					/>
				</Navbar.Brand>
			</Nav.Item>
			<Nav.Link as={Link} to="/" className="nav-link">
				Home
			</Nav.Link>
			<Nav.Link as={Link} to="/about" className="nav-link">
				About
			</Nav.Link>
			<Nav.Link as={Link} to="/contact" className="nav-link">
				Contact
			</Nav.Link>
		</Nav>
	);
	const userLinks = user && (
		<Nav className="ml-auto p-2">
			<CustomButton
				text="Select Company"
				className="me-2"
				onClick={() => {
					deleteStoredCompanyInformation();
					navigateTo('/select-company');
				}}
			/>
			<CustomButton
				variant="success"
				text="Create New Company"
				className="me-2"
				onClick={() => {
					deleteStoredCompanyInformation();
					navigateTo('/create-company');
				}}
			/>
		</Nav>
	);
	const authenticationLinks = (
		<Nav>
			<CustomButton
				text="Login"
				onClick={() => {
					deleteStoredCompanyInformation();
					navigateTo('/login');
				}}
			/>
			<CustomButton
				variant="success"
				text="Register"
				onClick={() => navigateTo('/register')}
			/>
		</Nav>
	);

	return (
		<Navbar expand="lg" className="custom-navbar" sticky="top">
			<Navbar.Toggle aria-controls="basic-navbar-nav" />
			<Navbar.Collapse id="basic-navbar-nav">
				{isCompanyUser ? (
					<CompanyHeader />
				) : user ? (
					userLinks
				) : (
					guestLinks
				)}
				{!user && authenticationLinks}
			</Navbar.Collapse>
			{user && <RightSignInUserMenu userEmail={user.email} />}{' '}
			{/* Right side menu for logged in users */}
		</Navbar>
	);
}

export default Header;

// import Nav from 'react-bootstrap/Nav';
// import Navbar from 'react-bootstrap/Navbar';
// import logo from '../../assets/images/logo.png';
// import { Link } from 'react-router-dom';
// import { useNavigate } from 'react-router-dom';
// import { useAppSelector } from '../store/configureStore';
// import CustomButton from '../components/CustomButton';
// import RightSignInUserMenu from './SignedInMenu';
// import './Header.scss'; // Ensure this file contains the updated CSS
// import CompanyHeader from './CompanyHeader';
// import {
// 	deleteStoredCompanyInformation,
// 	getAccessId,
// } from '../../features/Masters/Company/CompanyInformation';

// function Header() {
// 	const { user } = useAppSelector((state) => state.account);
// 	const navigate = useNavigate();
// 	const accessId = getAccessId();
// 	const navigateTo = (path: any) => navigate(path);
// 	const isCompanyUser = user && accessId;

// 	const guestLinks = (
// 		<Nav className="me-auto">
// 			<Nav.Item>
// 				<Navbar.Brand as={Link} to="/">
// 					<img
// 						src={logo}
// 						width="35"
// 						height="35"
// 						alt="Logo"
// 						className="logo"
// 					/>
// 				</Navbar.Brand>
// 			</Nav.Item>
// 			<Nav.Link as={Link} to="/" className="nav-link">
// 				Home
// 			</Nav.Link>
// 			<Nav.Link as={Link} to="/about" className="nav-link">
// 				About
// 			</Nav.Link>
// 			<Nav.Link as={Link} to="/contact" className="nav-link">
// 				Contact
// 			</Nav.Link>
// 		</Nav>
// 	);

// 	const userLinks = user && (
// 		<Nav className="ms-auto">
// 			<CustomButton
// 				text="Select Company"
// 				className="me-2"
// 				onClick={() => {
// 					deleteStoredCompanyInformation();
// 					navigateTo('/select-company');
// 				}}
// 			/>
// 			<CustomButton
// 				variant="success"
// 				text="Create New Company"
// 				className="me-2"
// 				onClick={() => {
// 					deleteStoredCompanyInformation();
// 					navigateTo('/create-company');
// 				}}
// 			/>
// 		</Nav>
// 	);

// 	const authenticationLinks = (
// 		<Nav className="ms-auto">
// 			<CustomButton
// 				text="Login"
// 				onClick={() => {
// 					deleteStoredCompanyInformation();
// 					navigateTo('/login');
// 				}}
// 			/>
// 			<CustomButton
// 				variant="success"
// 				text="Register"
// 				onClick={() => navigateTo('/register')}
// 			/>
// 		</Nav>
// 	);

// 	return (
// 		<Navbar expand="lg" className="custom-navbar " sticky="top">
// 			<Navbar.Brand as={Link} to="/">
// 				<img
// 					src={logo}
// 					width="35"
// 					height="35"
// 					alt="Logo"
// 					className="logo"
// 				/>
// 			</Navbar.Brand>
// 			<Navbar.Toggle aria-controls="basic-navbar-nav"></Navbar.Toggle>
// 			<Navbar.Collapse id="basic-navbar-nav">
// 				{isCompanyUser ? (
// 					<CompanyHeader />
// 				) : user ? (
// 					userLinks
// 				) : (
// 					guestLinks
// 				)}
// 				{!user && authenticationLinks}
// 			</Navbar.Collapse>
// 			{user && <RightSignInUserMenu userEmail={user.email} />}{' '}
// 		</Navbar>
// 	);
// }

// export default Header;
