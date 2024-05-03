import { useSelector } from 'react-redux';
import Spinner from "react-bootstrap/esm/Spinner";
import { selectLoading } from './loadingSlice';


export default function LoadingComponent() {
  const isLoading = useSelector(selectLoading);

  if (!isLoading) return null;

  return (
    <div className="loading-overlay">
      <Spinner animation="border" role="status" variant="success" className="large-spinner">
        <span className="visually-hidden">Loading...</span>
      </Spinner>
    </div>
  );
}
