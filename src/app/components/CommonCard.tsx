import React from 'react';
import { Button, Card, Col, Row } from 'react-bootstrap';

interface CommonCardProps {
	header: string;
	className?: string;
	children: React.ReactNode;
	style?: React.CSSProperties;
	footerContent?: string;
	size?: '100%' | '75%' | '50%' | '40%' | '35%' | '25%';
	showControlPanelButton?: boolean; // New prop to control the visibility of the control panel button
	onControlPanelClick?: () => void; // Optional click handler prop
}

const CommonCard: React.FC<CommonCardProps> = ({
	header,
	className,
	children,
	style,
	footerContent,
	size = '50%',
	showControlPanelButton = false,
	onControlPanelClick,
}) => {
	const getColumnSizeClass = () => {
		switch (size) {
			case '100%':
				return 'col-12 col-md-12';
			case '75%':
				return 'col-12 col-md-9'; // Adjusted for semantic clarity
			case '50%':
				return 'col-12 col-md-6';
			case '25%':
				return 'col-12 col-md-3';
			default:
				return 'col-12';
		}
	};
	// Adjust the card height based on the size prop
	const cardStyle = size === '100%' ? { ...style, height: '100vh' } : style;
	const combinedClassName = `shadow-sm ${className || ''}`;

	return (
		<Row className="justify-content-center align-items-stretch">
			<Col className={getColumnSizeClass()}>
				<Card className={combinedClassName} style={cardStyle}>
					<Card.Header className="app-card-header d-flex justify-content-between align-items-center">
						<div
							style={{ flex: 1, textAlign: 'center' }}
							className="py-2 fs-2"
						>
							<span>{header}</span>
						</div>
						{showControlPanelButton && (
							<Button
								variant="success"
								size="sm"
								style={{ position: 'absolute', right: 16 }}
								onClick={() => onControlPanelClick?.()} // Assign the click handler
							>
								Control Panel
							</Button>
						)}
					</Card.Header>
					<Card.Body className="py-1 custom-scrollable-content">
						{children}
					</Card.Body>
					{footerContent && (
						<Card.Footer className="app-card-footer text-muted">
							{footerContent}
						</Card.Footer>
					)}
				</Card>
			</Col>
		</Row>
	);
};

export default CommonCard;
