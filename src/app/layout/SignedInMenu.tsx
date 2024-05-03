import React from 'react';
import { Dropdown } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../store/configureStore';
import { signOut } from '../../features/UserAccount/accountSlice';
import './Header.scss'; // Ensure this file contains the updated styles


interface RightSignInUserMenuProps {
  userEmail: string;
}

const RightSignInUserMenu: React.FC<RightSignInUserMenuProps> = ({ userEmail }) => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();



  return (
    <Dropdown as="div" className="dropdown-on-hover ms-auto">
      <Dropdown.Toggle id="dropdown-basic" className="user-menu-toggle" bsPrefix="p-0">
        <i className="bi bi-person-circle"></i>
      </Dropdown.Toggle>

      <Dropdown.Menu align="end">
        <Dropdown.Item>{userEmail}</Dropdown.Item>
        <Dropdown.Item onClick={() => {
          dispatch(signOut());
          navigate('/');
        }}>Logout</Dropdown.Item>
      </Dropdown.Menu>
    </Dropdown>
  );
};

export default RightSignInUserMenu;
