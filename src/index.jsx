import React from 'react';
import ReactDOM from 'react-dom';
import * as Sentry from '@sentry/react';
import 'typeface-muli';
import './i18n';
import './react-chartjs-2-defaults';
import './styles/index.css';
import App from 'app/App';

if (import.meta.env.VITE_SENTRY_DSN) {
	Sentry.init({
		dsn: import.meta.env.VITE_SENTRY_DSN,
		environment: import.meta.env.MODE
	});
}

ReactDOM.render(<App />, document.getElementById('root'));
