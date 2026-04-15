import { test as setup, expect } from '@playwright/test';
import { existsSync } from 'fs';

const AUTH_PATH = 'tests/auth.json';

setup('auth.json 로드 확인', async () => {
	expect(existsSync(AUTH_PATH), `${AUTH_PATH} 파일이 존재해야 합니다`).toBeTruthy();
});
