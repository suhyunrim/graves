import { chromium } from 'playwright';

const BASE_URL = 'https://graves.zeroboom.lol';
const RIOT_ID = 'ZeroBoom#KR1';
const OUTPUT = './public/assets/images/welcome/bracket.png';
const VIEWPORT = { width: 1440, height: 900 };

const HIDE_CHROME_CSS = `
	#fuse-navbar, .fuse-navbar, [class*="navbar"],
	#fuse-toolbar, [class*="toolbar"] > .MuiAppBar-root {
		display: none !important;
	}
`;

(async () => {
	const browser = await chromium.launch({ headless: true });
	const context = await browser.newContext({ viewport: VIEWPORT, deviceScaleFactor: 2 });
	const page = await context.newPage();

	console.log('로그인 중...');
	await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle', timeout: 45000 });
	await page.waitForTimeout(2000);
	const input = page.locator('input[name="riotId"]');
	if (await input.count()) {
		await input.fill(RIOT_ID);
		await page.waitForTimeout(500);
		await page.locator('button[type="submit"]').first().click();
		await page.waitForTimeout(6000);
	}
	console.log('로그인 후 URL:', page.url());

	// 토너먼트 목록에서 첫 토너먼트 id 찾기
	await page.goto(`${BASE_URL}/tournament`, { waitUntil: 'networkidle', timeout: 45000 });
	await page.waitForTimeout(3000);
	const links = await page.locator('a[href^="/tournament/"]').evaluateAll((els) =>
		els.map((e) => e.getAttribute('href')).filter(Boolean)
	);
	console.log('발견한 토너먼트 링크:', links.slice(0, 10));
	if (!links.length) {
		console.log('⚠️  토너먼트가 없음 — 브래킷 캡처 불가');
		await browser.close();
		return;
	}

	// 여러 토너먼트를 돌며 실제 대진표(브래킷)가 그려진 것을 찾는다.
	// 경매 중 토너먼트는 경매 화면만 나오므로 라운드 컬럼이 있는 것만 캡처.
	for (const href of links.slice(0, 10)) {
		console.log(`확인: ${href}`);
		await page.goto(`${BASE_URL}${href}`, { waitUntil: 'networkidle', timeout: 45000 });
		await page.addStyleTag({ content: HIDE_CHROME_CSS });
		await page.waitForTimeout(4500);

		const container = page.locator('div.container').first();
		try {
			await container.waitFor({ state: 'visible', timeout: 8000 });
		} catch {
			continue;
		}

		const text = (await container.innerText().catch(() => '')) || '';
		const hasBracket = text.includes('대진표') && (text.includes('결승') || text.includes('4강'));
		if (!hasBracket) {
			console.log('  (대진표 없음 — 건너뜀)');
			continue;
		}

		const box = await container.boundingBox();
		if (!box) continue;

		const height = Math.min(box.height, 900);
		await page.screenshot({
			path: OUTPUT,
			clip: { x: box.x, y: box.y, width: box.width, height }
		});
		console.log(`  ✓ ${OUTPUT}  (${Math.round(box.width)}x${Math.round(height)})  from ${href}`);
		break;
	}

	await browser.close();
	console.log('완료.');
})();
