import { Suspense, useEffect, useState } from 'react';
import { Link, useNavigate } from "react-router-dom";
import Nav from "react-bootstrap/Nav";
import agent from '../api/agent';
import CustomButton from '../components/CustomButton';
import Dropdown from 'react-bootstrap/esm/Dropdown';
import { useAppDispatch, useAppSelector } from '../store/configureStore';
import { clearCurrentFinancialYear, getCurrentFinancialYear, updateAndFetchCurrentFinancialYear } from '../../features/Masters/FinancialYear/financialYearSlice';
import { toCustomDateFormat } from '../utils/dateUtils';
import { Button, Container, DropdownDivider } from 'react-bootstrap';
import { deleteStoredCompanyInformation, getAccessIdOrRedirect } from '../../features/Masters/Company/CompanyInformation';
import { FinancialYearDto } from '../../features/Masters/FinancialYear/financialYearDto';
import { CommonModal } from '../components/Components';
import FinancialYearForm from '../../features/Masters/FinancialYear/FinancialYearForm';
import './Header.scss';

function CompanyHeader() {
    const [companyName, setCompanyName] = useState('');
    const navigate = useNavigate();
    const accessId = getAccessIdOrRedirect();
    const dispatch = useAppDispatch();
    const [allFinancialYears, setAllFinancialYears] = useState<FinancialYearDto[]>([]);
    const [showFYYearModal, setShowFYYearModal] = useState(false);
    const { currentFinancialYear } = useAppSelector((state) => state.financialYear);

    const formatCompanyName = (name: string) => {
        if (name.length > 50) {
            const words = name.split(' ');
            return words.length >= 2 ? words[0] + ' ' + words[1] : name;
        }
        return name;
    };
    useEffect(() => {
        if (!accessId) {
            return;
        }
        const getCompanyDetails = async () => {
            try {
                const response = await agent.Company.getCompanyName(accessId);
                setCompanyName(formatCompanyName(response))
            } catch (error) {
                console.error('Error fetching company details:', error);
            }
        };
        getCompanyDetails();
    }, [accessId]);

    useEffect(() => {
        if (!currentFinancialYear) {
            dispatch(getCurrentFinancialYear());
        }
    }, [accessId]);

    async function getAllFinancialYears() {
        try {
            const response = await agent.FinancialYear.getAllFinancialYears(accessId);
            setAllFinancialYears(response);
        }
        catch (error) {
            console.error('Error fetching all financial years:', error);
        }
    }
    useEffect(() => {
        getAllFinancialYears();
    }, [accessId]);

    const handleExitCompany = () => {
        deleteStoredCompanyInformation();
        dispatch(clearCurrentFinancialYear());
        navigate('/select-company');
    };


    const handleSelectFinancialYear = (newFinancialYear: Date) => {
        dispatch(updateAndFetchCurrentFinancialYear(newFinancialYear));
    };

    const isCurrentFinancialYear = (financialYear: FinancialYearDto) => {
        return currentFinancialYear && financialYear.financialYearFrom === currentFinancialYear.financialYearFrom;
    };
    const handleEditFinancialYear = (financialYear: FinancialYearDto) => {
        navigate('/edit-financial-year', { state: { financialYear } });
    };

    return (
        <Container className="d-flex justify-content-between align-items-center header-container">
            <Nav className="flex-grow-1 align-items-center">
                <Nav.Link className="nav-item" as={Link} to={`/dashboard/${accessId}`} >
                    <CustomButton size="sm" variant='success' text={companyName} />
                </Nav.Link>
                <Dropdown as="div" className="dropdown-on-hover ">
                    <Dropdown.Toggle as={Nav.Link} id="dropdown-autoclose-true" className="dropdown-toggle">Masters</Dropdown.Toggle>
                    <Dropdown.Menu className="custom-dropdown-menu">
                        <Dropdown.Item as={Link} to={'/account'}>Account</Dropdown.Item>
                        <Dropdown.Divider />
                        <Dropdown.Item as={Link} to={'/account-List'}>Account List</Dropdown.Item>
                        <Dropdown.Divider />
                        <Dropdown.Item as={Link} to={'/account-group'}>Account Group</Dropdown.Item>
                        <Dropdown.Divider />
                        <Dropdown.Item as={Link} to={'/city'}>City</Dropdown.Item>
                        <Dropdown.Divider />
                        <Dropdown.Item as={Link} to={'/item-company'}>Item Company</Dropdown.Item>
                        <Dropdown.Divider />
                        <Dropdown.Item as={Link} to={'/item-category'}>Item Category</Dropdown.Item>
                        <Dropdown.Divider />
                        <Dropdown.Item as={Link} to={'/item-godown'}>Item Godown</Dropdown.Item>
                        <Dropdown.Divider />
                        <Dropdown.Item as={Link} to={'/item-unit'}>Item Units</Dropdown.Item>
                        <Dropdown.Divider />
                        <Dropdown.Item as={Link} to={'/gst-slab'}>GST Slab</Dropdown.Item>
                        <Dropdown.Divider />
                        <Dropdown.Item as={Link} to={'/item'}>Item</Dropdown.Item>
                        <Dropdown.Divider />
                        <Dropdown.Item as={Link} to={'/item-list'}>Item List</Dropdown.Item>
                        <Dropdown.Divider />
                        <Dropdown.Item as={Link} to={'/sale-billbook'}>Sale BillBook</Dropdown.Item>
                    </Dropdown.Menu>
                </Dropdown>

                <Dropdown as="div" className="dropdown-on-hover ">
                    <Dropdown.Toggle as={Nav.Link} id="dropdown-autoclose-true" className="dropdown-toggle">Vouchers</Dropdown.Toggle>
                    <Dropdown.Menu className="custom-dropdown-menu">
                        <Dropdown.Item as={Link} to={'/Voucher/Payment'}>Payment</Dropdown.Item>
                        <Dropdown.Divider />
                        <Dropdown.Item as={Link} to={'/Voucher/Receipt'}>Receipt</Dropdown.Item>
                        <Dropdown.Divider />
                        <Dropdown.Item as={Link} to={'/Voucher/BankEntry'}>Bank Entry</Dropdown.Item>
                        <Dropdown.Divider />
                        <Dropdown.Item as={Link} to={'/Voucher/JournalEntry'}>Journal Entry</Dropdown.Item>
                        <Dropdown.Divider />
                        <Dropdown.Item as={Link} to={'/Voucher/Sale'}>Sale Voucher</Dropdown.Item>
                    </Dropdown.Menu>
                </Dropdown>
                <Dropdown as="div" className="dropdown-on-hover">
                    <Dropdown.Toggle id="dropdown-autoclose-true" as={Nav.Link} className="dropdown-toggle">Reports</Dropdown.Toggle>
                    <Dropdown.Menu className="custom-dropdown-menu">
                        <Dropdown.Item as={Link} to={'/Report/Ledger'}>Ledger</Dropdown.Item>
                        <Dropdown.Divider />
                        <Dropdown.Item as={Link} to={'/Report/TrialBalance'}>Trial Balance</Dropdown.Item>
                        <Dropdown.Divider />
                    </Dropdown.Menu>
                </Dropdown>

            </Nav>

            <div>
                {currentFinancialYear && currentFinancialYear.financialYearFrom && currentFinancialYear.financialYearTo && (
                    <Dropdown as="div" className="dropdown-on-hover" >
                        <Dropdown.Toggle id="dropdown-autoclose-true" className='btn btn-sm'>
                            {new Date(currentFinancialYear.financialYearFrom).getFullYear()} - {new Date(currentFinancialYear.financialYearTo).getFullYear()}
                        </Dropdown.Toggle>

                        <Dropdown.Menu className="custom-dropdown-menu">
                            {allFinancialYears.map((financialYear: FinancialYearDto, index) => {
                                const financialYearFrom = toCustomDateFormat(new Date(financialYear.financialYearFrom));
                                const financialYearTo = financialYear.financialYearTo
                                    ? toCustomDateFormat(new Date(financialYear.financialYearTo))
                                    : null;
                                const itemStyle = isCurrentFinancialYear(financialYear) ? { backgroundColor: '#f0f0f0 !important', fontWeight: 'bold !important' } : {};

                                return (
                                    <Dropdown.Item key={index} style={itemStyle} onClick={() => handleSelectFinancialYear(new Date(financialYear.financialYearFrom))}>
                                        {financialYearFrom}{financialYearTo ? ` to ${financialYearTo}` : ''}
                                        <Button
                                            onClick={() => handleEditFinancialYear(financialYear)}
                                            className="bi bi-pencil-square ms-2"
                                            variant='none'
                                            size='sm'
                                            style={itemStyle}
                                        />
                                    </Dropdown.Item>
                                );
                            })}
                            <DropdownDivider />
                            <div className="d-flex align-items-center justify-content-center ">
                                <Dropdown.Item onClick={() => setShowFYYearModal(true)}>
                                    <div className='bi bi-plus-lg'> Add New</div>
                                </Dropdown.Item>
                            </div>
                        </Dropdown.Menu>
                    </Dropdown>
                )}
            </div>
            <CustomButton text='Exit Company' variant="outline-secondary" className='m-2' onClick={handleExitCompany} />
            <CommonModal show={showFYYearModal} onHide={() => { setShowFYYearModal(false); }} size='sm'>
                <Suspense fallback={<div>Loading...</div>}>
                    <FinancialYearForm onSuccessfulSubmit={async () => { await getAllFinancialYears(); setShowFYYearModal(false); }} />
                </Suspense>
            </CommonModal>

        </Container>

    );
}

export default CompanyHeader;
