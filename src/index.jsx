import React from 'react';
import { createRoot } from 'react-dom/client';
import * as Sentry from '@sentry/react';
import 'typeface-muli';
import './i18n';
import './react-chartjs-2-defaults';
import './styles/index.css';
import App from 'app/App';

// __COMMIT_HASH__ 는 vite.config.js 의 define 으로 빌드 시 주입된다
const commitHash = typeof __COMMIT_HASH__ !== 'undefined' ? __COMMIT_HASH__ : 'unknown';
// eslint-disable-next-line no-console
console.info(`[graves] commit: ${commitHash}`);
const commitMeta = document.createElement('meta');
commitMeta.name = 'app-commit';
commitMeta.content = commitHash;
document.head.appendChild(commitMeta);

if (import.meta.env.VITE_SENTRY_DSN) {
	Sentry.init({
		dsn: import.meta.env.VITE_SENTRY_DSN,
		environment: import.meta.env.MODE,
		release: commitHash
	});
}

createRoot(document.getElementById('root')).render(<App />);
