import React from 'react';
import * as Sentry from '@sentry/react';
import { Button } from '@mui/material';

const CHUNK_ERROR = /dynamically imported module|Importing a module script failed|ChunkLoadError/i;

function Fallback({ error, resetError }) {
	const isChunk = CHUNK_ERROR.test(error?.message || '');

	// 청크 에러면 하드 리로드(새 index/청크 재요청)로만 복구 가능. 그 외 런타임 에러는 soft 재시도.
	const handleRetry = () => (isChunk ? window.location.reload() : resetError());
	// client-side navigate가 아니라 하드 이동 → index를 새로 받아 죽은 청크에서 확실히 탈출.
	const handleHome = () => window.location.assign('/dashboard');

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
				<Button variant="contained" color="primary" onClick={handleRetry}>
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
		<Sentry.ErrorBoundary fallback={({ error, resetError }) => <Fallback error={error} resetError={resetError} />}>
			{children}
		</Sentry.ErrorBoundary>
	);
}

export default RouteErrorBoundary;
