import React from 'react';
import * as Sentry from '@sentry/react';
import { Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

function Fallback({ resetError }) {
	const navigate = useNavigate();

	const handleHome = () => {
		resetError();
		navigate('/dashboard');
	};

	return (
		<div
			style={{
				display: 'flex',
				flexDirection: 'column',
				justifyContent: 'center',
				alignItems: 'center',
				minHeight: '60vh',
				padding: 24,
				textAlign: 'center'
			}}
		>
			<h2 style={{ marginBottom: 12 }}>페이지를 표시할 수 없습니다</h2>
			<p style={{ marginBottom: 24, color: 'rgba(0,0,0,0.6)' }}>
				일시적인 오류가 발생했습니다. 다시 시도해주세요.
			</p>
			<div style={{ display: 'flex', gap: 12 }}>
				<Button variant="contained" color="primary" onClick={resetError}>
					다시 시도
				</Button>
				<Button variant="outlined" onClick={handleHome}>
					대시보드로
				</Button>
			</div>
		</div>
	);
}

function RouteErrorBoundary({ children }) {
	return (
		<Sentry.ErrorBoundary fallback={({ resetError }) => <Fallback resetError={resetError} />}>
			{children}
		</Sentry.ErrorBoundary>
	);
}

export default RouteErrorBoundary;
