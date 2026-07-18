// 릴리즈 노트 자동 생성.
// public/release-notes.json 최신 항목 날짜 이후 ~ until(기본: 어제)까지,
// 커밋이 있는 날짜마다 항목을 하나씩 만든다. 며칠 밀려 있어도 날짜별로 나뉜다.
//
// 날짜 기준은 항상 KST. 항목의 date는 그 커밋들이 실제로 올라간 날짜다.
// 기본 종료일이 "어제"인 이유: 오늘은 아직 안 끝나서, 오늘로 항목을 만들면
// 그 뒤에 올라오는 오늘 커밋들이 다음 실행 대상에서 빠져버린다.
//
// 사용:
//   node scripts/generate-release-notes.mjs
//   node scripts/generate-release-notes.mjs --since=2026-07-09 --until=2026-07-17
//   node scripts/generate-release-notes.mjs --dry-run

import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync, appendFileSync } from 'node:fs';

const NOTES_PATH = 'public/release-notes.json';
const MODEL = 'claude-sonnet-5';
const TZ = 'Asia/Seoul';

const args = Object.fromEntries(
	process.argv.slice(2).map(a => {
		const [k, ...v] = a.replace(/^--/, '').split('=');
		return [k, v.length ? v.join('=') : true];
	})
);

const toKstDate = date =>
	new Intl.DateTimeFormat('en-CA', { timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit' }).format(date);

const notes = JSON.parse(readFileSync(NOTES_PATH, 'utf8'));
const since = args.since || (notes.length > 0 ? notes[0].date : '2000-01-01');
const until = args.until || toKstDate(new Date(Date.now() - 24 * 60 * 60 * 1000));

// since 날짜는 이미 반영된 것으로 보고 그 다음날부터. 같은 날짜로 항목이 두 번 생기지 않게 한다.
const gitLog = execFileSync(
	'git',
	[
		'log',
		`--after=${since} 23:59:59 +0900`,
		`--before=${until} 23:59:59 +0900`,
		'--no-merges',
		// --after/--before가 커밋 날짜로 거르므로 그룹핑도 커밋 날짜로 맞춘다.
		// 저자 날짜(%ad)로 묶으면 리베이스·봇 커밋에서 기간 밖 날짜가 섞여 나온다.
		// 날짜 변환은 %cI(오프셋 포함 ISO)를 받아 JS에서 직접 한다 —
		// git의 format-local은 환경(윈도우에서 TZ 무시 등)에 따라 기준 시간대가 달라진다.
		'--format=%cI\t%s'
	],
	{ encoding: 'utf8' }
);

const byDate = new Map();
for (const line of gitLog.split('\n')) {
	if (!line.trim()) continue;
	const tab = line.indexOf('\t');
	const date = toKstDate(new Date(line.slice(0, tab)));
	const subject = line.slice(tab + 1);
	if (!byDate.has(date)) byDate.set(date, []);
	byDate.get(date).push(subject);
}
const dates = [...byDate.keys()].sort();

console.log(`대상 기간: ${since} 이후 ~ ${until} (KST), 날짜 ${dates.length}개`);
for (const d of dates) console.log(`  ${d}: 커밋 ${byDate.get(d).length}개`);

if (args['dry-run']) process.exit(0);
if (dates.length === 0) {
	console.log('생성할 항목 없음');
	process.exit(0);
}

async function ask(prompt, maxTokens) {
	const response = await fetch('https://api.anthropic.com/v1/messages', {
		method: 'POST',
		headers: {
			'content-type': 'application/json',
			'x-api-key': process.env.ANTHROPIC_API_KEY,
			'anthropic-version': '2023-06-01'
		},
		body: JSON.stringify({ model: MODEL, max_tokens: maxTokens, messages: [{ role: 'user', content: prompt }] })
	});
	const data = await response.json();
	// 모델에 따라 첫 블록이 텍스트가 아닐 수 있다(thinking 등) → 텍스트 블록을 찾아 쓴다
	const block = (data.content || []).find(b => b.type === 'text');
	if (!block) throw new Error(`응답에 텍스트 블록이 없음: ${JSON.stringify(data).slice(0, 500)}`);
	return block.text;
}

const changesPrompt = commits =>
	`다음은 git 커밋 메시지 목록이야. 이걸 유저가 읽을 릴리즈 노트로 변환해줘.

규칙:
- eslint, CLAUDE.md, 설정파일 수정 같은 내부 작업은 제외
- 리팩토링, 코드 정리, 내부 로직 변경 등 유저에게 보이지 않는 변경은 제외
- 기술 용어(컴포넌트명, 함수명, CSS 속성 등)를 사용하지 말고 유저가 이해할 수 있는 말로 작성
- 예시: "FuseScrollbars 활성화 조건 버그 수정" (X) → "내 정보 페이지에서 스크롤이 안 되던 버그 수정" (O)
- 유저 관점에서 의미 있는 변경만 포함
- 한글로 간결하게 작성
- 문체는 명사형 종결로 통일: "~추가", "~수정", "~개선", "~표시"
  ("~됐어요", "~할 수 있어요", "~합니다" 같은 종결어미는 쓰지 말 것)
- 비슷한 커밋은 하나로 합쳐
- JSON 객체로만 응답 (다른 텍스트 없이)
- 형식: {"changes": ["변경1", "변경2"], "versionBump": "minor" 또는 "patch"}
- versionBump 판단 기준: 새로운 기능/페이지 추가 = "minor", 버그 수정/UI 개선/텍스트 변경 등 소규모 = "patch"
- 변경사항이 없으면 {"changes": [], "versionBump": "patch"} 반환

커밋 목록:
${commits.join('\n')}`;

const titlePrompt = changes =>
	`다음 변경사항 목록을 보고 한글로 짧은 제목(10자 이내)을 지어줘. 제목 텍스트만 응답해.\n\n${JSON.stringify(changes)}`;

const nextVersion = bump => {
	if (notes.length === 0) return bump === 'minor' ? '0.1.0' : '0.0.1';
	const [major, minor, patch] = notes[0].version.split('.').map(Number);
	return bump === 'minor' ? `${major}.${minor + 1}.0` : `${major}.${minor}.${patch + 1}`;
};

const created = [];
for (const date of dates) {
	const raw = await ask(changesPrompt(byDate.get(date)), 4096);
	const json = raw.match(/\{[\s\S]*\}/);
	const parsed = json ? JSON.parse(json[0]) : { changes: [], versionBump: 'patch' };

	if (!parsed.changes || parsed.changes.length === 0) {
		console.log(`${date}: 유저에게 보일 변경 없음 → 건너뜀`);
		continue;
	}

	const title = (await ask(titlePrompt(parsed.changes), 512)).trim();
	const version = nextVersion(parsed.versionBump || 'patch');
	notes.unshift({ version, date, title, changes: parsed.changes });
	created.push(version);
	console.log(`${date}: v${version} "${title}" (${parsed.changes.length}건)`);
}

if (created.length === 0) {
	console.log('생성할 항목 없음');
	process.exit(0);
}

writeFileSync(NOTES_PATH, `${JSON.stringify(notes, null, '\t')}\n`);

if (process.env.GITHUB_OUTPUT) {
	appendFileSync(process.env.GITHUB_OUTPUT, `versions=${created.join(', ')}\n`);
}
