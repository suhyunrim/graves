import { existsSync } from 'fs';
import path from 'path';
import { FullConfig } from '@playwright/test';

const AUTH_PATH = path.resolve(__dirname, 'auth.json');

export default function globalSetup(config: FullConfig) {
	// e2e 프로젝트를 명시적으로 요청했는데 auth.json이 없으면 안내 후 종료
	const explicitlyRequestedE2E = process.argv.some(arg => arg === 'e2e');

	if (explicitlyRequestedE2E && !existsSync(AUTH_PATH)) {
		console.log('');
		console.log('╔══════════════════════════════════════════════════════════╗');
		console.log('║  auth.json이 없습니다!                                  ║');
		console.log('║                                                          ║');
		console.log('║  최초 1회 아래 명령어로 디스코드 로그인을 진행하세요:    ║');
		console.log('║                                                          ║');
		console.log('║  npx playwright codegen                                  ║');
		console.log('║    --save-storage=tests/auth.json                        ║');
		console.log('║    http://localhost:5173/login                            ║');
		console.log('║                                                          ║');
		console.log('║  브라우저에서 Discord 로그인 후 대시보드 진입 확인,      ║');
		console.log('║  그 다음 브라우저를 닫으면 auth.json이 저장됩니다.       ║');
		console.log('╚══════════════════════════════════════════════════════════╝');
		console.log('');
		process.exit(1);
	}
}
