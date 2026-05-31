import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';

const BASE_URL = 'https://graves.zeroboom.lol';
const RIOT_ID = 'ZeroBoom#KR1';
const OUTPUT_DIR = './public/assets/images/welcome';
const VIEWPORT = { width: 1440, height: 900 };

// 각 캡처 대상. selector 는 캡처 직전에 page 안에서 평가된다.
// clipHeight: content 컬럼 상단에서 잘라낼 높이(px). null 이면 element 전체.
const TARGETS = [
	{ name: 'ranking', path: '/ranking', wait: 3500, clipHeight: 780 },
	{ name: 'dashboard', path: '/dashboard', wait: 4000, clipHeight: 820 },
	{ name: 'myinfo-chart', path: '/myinfo', wait: 4500, clipHeight: 820 },
	{
		name: 'achievements',
		path: '/myinfo',
		wait: 4500,
		clipHeight: 820,
		// 업적 탭으로 전환
		beforeShot: async (page) => {
			const tabs = page.locator('.MuiTab-root');
			const count = await tabs.count();
			if (count > 1) {
				await tabs.nth(1).click();
				await page.waitForTimeout(2500);
			}
		}
	}
];

// content 컬럼만 깔끔하게 캡처. navbar/toolbar/sidebar 는 .container 바깥이라 자동 제외되지만,
// 혹시 떠 있는 chrome 이 끼면 보강해서 숨긴다.
const HIDE_CHROME_CSS = `
	#fuse-navbar, .fuse-navbar, [class*="navbar"],
	#fuse-toolbar, [class*="toolbar"] > .MuiAppBar-root {
		display: none !important;
	}
`;

async function captureContent(page, target) {
	const container = page.locator('div.container').first();
	await container.waitFor({ state: 'visible', timeout: 15000 });
	const box = await container.boundingBox();
	if (!box) throw new Error(`boundingBox 실패: ${target.name}`);
	const height = target.clipHeight ? Math.min(box.height, target.clipHeight) : box.height;
	const outPath = `${OUTPUT_DIR}/${target.name}.png`;
	await page.screenshot({
		path: outPath,
		clip: { x: box.x, y: box.y, width: box.width, height }
	});
	console.log(`  ✓ ${outPath}  (${Math.round(box.width)}x${Math.round(height)})`);
}

async function collectStats(page) {
	// 히어로용 실제 통계 텍스트 수집(있으면). 실패해도 무시.
	try {
		return await page.evaluate(() => {
			const txt = document.body.innerText || '';
			return { sample: txt.slice(0, 200) };
		});
	} catch {
		return null;
	}
}

(async () => {
	await mkdir(OUTPUT_DIR, { recursive: true });

	const browser = await chromium.launch({ headless: true });
	const context = await browser.newContext({
		viewport: VIEWPORT,
		deviceScaleFactor: 2
	});
	const page = await context.newPage();

	// ── 로그인 ──
	console.log('로그인 중...');
	await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle', timeout: 45000 });
	await page.waitForTimeout(2000);
	const input = page.locator('input[name="riotId"]');
	if (await input.count()) {
		await input.fill(RIOT_ID);
		await page.waitForTimeout(500);
		await page.locator('button[type="submit"]').first().click();
		await page.waitForTimeout(6000);
	} else {
		console.log('⚠️  riotId 입력 필드를 못 찾음 — 로그인 폼이 바뀌었을 수 있음');
	}
	console.log('로그인 후 URL:', page.url());

	// ── 캡처 ──
	for (const target of TARGETS) {
		console.log(`캡처: ${target.name} (${target.path})`);
		await page.goto(`${BASE_URL}${target.path}`, { waitUntil: 'networkidle', timeout: 45000 });
		await page.addStyleTag({ content: HIDE_CHROME_CSS });
		await page.waitForTimeout(target.wait);
		if (target.beforeShot) await target.beforeShot(page);
		try {
			await captureContent(page, target);
		} catch (e) {
			console.log(`  ✗ ${target.name} 실패: ${e.message}`);
		}
	}

	const stats = await collectStats(page);
	if (stats) console.log('통계 샘플:', JSON.stringify(stats).slice(0, 160));

	await browser.close();
	console.log('완료. 출력 디렉토리:', OUTPUT_DIR);
})();
