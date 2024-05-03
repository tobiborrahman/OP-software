import Container from "react-bootstrap/esm/Container";
import { useLocation } from "react-router-dom";

function ServerError() {
  const { state } = useLocation();
  return (
    <Container>
      {state?.error ? (
        <>
          <h3>{state.error.title}</h3>
          <hr />
          <h5>{state.error.detail || "Internal server error"}</h5>
        </>
      ) : (
        <h5>Server error</h5>
      )}
    </Container>
  );
}

export default ServerError;
