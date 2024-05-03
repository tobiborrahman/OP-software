import { Container } from 'react-bootstrap';

const Footer = () => {
    return (
        <footer className="footer bg-light text-center py-2 shadow">
            <Container>
                <span className="text-muted">
                    <a href="https://facebook.com" className="text-secondary mx-1">
                        <i className="bi bi-facebook"></i>
                    </a>
                    <a href="https://twitter.com" className="text-secondary mx-1">
                        <i className="bi bi-twitter"></i>
                    </a>
                    <a href="https://instagram.com" className="text-secondary mx-1">
                        <i className="bi bi-instagram"></i>
                    </a>
                </span>
                <span className="text-muted small">© 2024 OP Software. All Rights Reserved.</span>
            </Container>
        </footer>
    );
};

export default Footer;
