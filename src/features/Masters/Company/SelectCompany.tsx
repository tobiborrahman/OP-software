import { useState, useEffect, useCallback } from 'react';
import agent from '../../../app/api/agent';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { Table, Button, Container, Row, Col, Form } from 'react-bootstrap';
import './Company.scss';
import { setLoading } from '../../../app/layout/loadingSlice';
import { useAppDispatch } from '../../../app/store/configureStore';
import { CompanyInformation } from './CompanyInformation';



function SelectCompany() {
  const [companies, setCompanies] = useState([]);
  const [filteredCompanies, setFilteredCompanies] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  //Loading companies
  useEffect(() => {
    const loadCompanies = async () => {
      dispatch(setLoading(true));
      try {
        const response = await agent.Company.getCompanies();
        if (response && response.length > 0) {
          setCompanies(response);
        } else {
          navigate('/select-company');
        }
      } catch (err: any) {
        console.error('Loading companies failed:', err);
        toast.error(`Error: ${err.message}`);
      } finally {
        dispatch(setLoading(false));
      }
    };

    loadCompanies();
  }, []);

  //Filter data
  useEffect(() => {
    const filterResults = (query: string) => {
      if (!query) {
        setFilteredCompanies(companies);
      } else {
        const lowercasedQuery = query.toLowerCase();
        const filteredData = companies.filter(
          (company: any) =>
            company.companyName.toLowerCase().includes(lowercasedQuery) ||
            company.gstin.toLowerCase().includes(lowercasedQuery)
        );
        setFilteredCompanies(filteredData);
      }
    };

    filterResults(searchQuery);
  }, [searchQuery, companies]);

  const handleRowClick = useCallback((company: CompanyInformation) => {
    sessionStorage.setItem('selectedCompanyInformation', JSON.stringify(company));
    navigate(`/dashboard`);
  }, [navigate]);

  const handleEditClick = useCallback(() => {
    navigate(`/edit-company`);
  }, [navigate]);


  return (
    <Container>
      <Row className="my-2">
        <Col>
          <h3 className="text-center">Select a Company</h3>
          <Form>
            <Form.Group controlId="searchQuery">
              <Form.Control
                className='app-form-input'
                type="text"
                placeholder="Search by company name or GSTIN..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ fontWeight: 500, textTransform: 'uppercase' }}
              />
            </Form.Group>
          </Form>
        </Col>
      </Row>
      <Row>
        <Col>
          <Table striped bordered hover responsive className='custom-table'>
            <thead>
              <tr>
                <th style={{ width: '10%' }}></th>
                <th style={{ width: '50%' }}>Company</th>
                <th style={{ width: '25%' }}>GST No.</th>
                <th style={{ width: '15%' }}></th>
              </tr>
            </thead>
            <tbody>
              {filteredCompanies.map((company: CompanyInformation, index) => (
                <tr
                  key={company.companyId}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRowClick(company);
                  }}
                  onKeyDown={(e) => {
                    e.stopPropagation();
                    handleRowClick(company);
                  }}
                >
                  <td>{index + 1}</td>
                  <td>{company.companyName}</td>
                  <td>{company.companyGSTIN}</td>
                  <td className='text-end'>
                    <Button variant='none' className='mr-2' onClick={(e) => {
                      e.stopPropagation();
                      handleEditClick();
                    }}>Edit</Button>

                    <Button variant="success" onClick={(e) => {
                      e.stopPropagation();
                      handleRowClick(company);
                    }}>Work on it</Button>

                  </td>
                </tr>
              ))}
            </tbody>
          </Table>

        </Col>
      </Row>
    </Container >
  );
}

export default SelectCompany;
