# CLAUDE.md

Behavioral guidelines to reduce common LLM coding mistakes. Merge with project-specific instructions as needed.

**Tradeoff:** These guidelines bias toward caution over speed. For trivial tasks, use judgment.

## 0-1. 언어

**한글로 대답한다.** 코드, 기술 용어 등 영어가 자연스러운 부분은 영어를 섞어도 된다.

## 0. 커밋 및 푸시 제한

**사용자가 명시적으로 허락하지 않은 커밋 및 푸시는 절대 금지.**

- git commit, git push 등의 명령은 사용자가 직접 요청하거나 허락한 경우에만 실행한다.
- 코드 변경 후 자동으로 커밋하거나 푸시하지 않는다.
- 커밋/푸시가 필요한 상황이라면 반드시 사용자에게 먼저 확인을 받는다.

## 1. Think Before Coding

**Don't assume. Don't hide confusion. Surface tradeoffs.**

Before implementing:
- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them - don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

## 2. Simplicity First

**Minimum code that solves the problem. Nothing speculative.**

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.

Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

## 3. Surgical Changes

**Touch only what you must. Clean up only your own mess.**

When editing existing code:
- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated dead code, mention it - don't delete it.

When your changes create orphans:
- Remove imports/variables/functions that YOUR changes made unused.
- Don't remove pre-existing dead code unless asked.

The test: Every changed line should trace directly to the user's request.

## 4. Goal-Driven Execution

**Define success criteria. Loop until verified.**

Transform tasks into verifiable goals:
- "Add validation" → "Write tests for invalid inputs, then make them pass"
- "Fix the bug" → "Write a test that reproduces it, then make it pass"
- "Refactor X" → "Ensure tests pass before and after"

For multi-step tasks, state a brief plan:
```
1. [Step] → verify: [check]
2. [Step] → verify: [check]
3. [Step] → verify: [check]
```

Strong success criteria let you loop independently. Weak criteria ("make it work") require constant clarification.

---

**These guidelines are working if:** fewer unnecessary changes in diffs, fewer rewrites due to overcomplication, and clarifying questions come before implementation rather than after mistakes.


# CLAUDE.md - Project Context for AI Assistance

## Project Overview

**Graves** - League of Legends 커스텀 게임 통계 대시보드 애플리케이션

사내/그룹 내 LoL 커스텀 게임 결과를 추적하고 랭킹 시스템을 제공하는 웹 애플리케이션.

## Tech Stack

- **Frontend**: React 19, react-router-dom 7
- **State Management**: redux 5 + react-redux 9 + redux-thunk
- **UI Framework**: @mui/material 9 (+ @mui/icons-material 9, @mui/lab, @mui/x-date-pickers)
- **Styling**: tss-react 4 (`makeStyles`), @emotion/react 11, tailwindcss 3
- **HTTP Client**: axios
- **Authentication**: Discord OAuth → JWT (jwt-decode 2)
- **Charts**: chart.js 4 + react-chartjs-2 5
- **i18n**: i18next + react-i18next
- **모니터링**: @sentry/react 7, @vercel/analytics, @vercel/speed-insights
- **테스트**: @playwright/test (smoke / content / e2e / visual 프로젝트 분리)
- **Build Tool**: Vite 6 + @vitejs/plugin-react

## Project Structure

```
src/
├── @fuse/              # Fuse UI 프레임워크 (레이아웃, 훅, 유틸리티)
├── @history/           # 커스텀 히스토리 모듈
├── @lodash/            # Lodash 유틸리티
├── app/
│   ├── auth/           # 인증 모듈 (Redux store)
│   ├── fuse-configs/   # 라우팅 & 네비게이션 설정
│   ├── fuse-layouts/   # 레이아웃 컴포넌트
│   ├── main/           # 주요 기능 모듈 (achievement, balanceReport,
│   │                   #   challenge, dashboard, groupSettings, honorRanking,
│   │                   #   login, matchHistory, myinfo, ranking, releaseNotes 등)
│   ├── services/       # API 서비스 (Camille Riot)
│   ├── store/          # 전역 Redux store
│   └── utility/        # 헬퍼 유틸리티 (camilleAxios 등)
├── styles/             # CSS/Tailwind 스타일
├── App.js              # 루트 컴포넌트
└── index.jsx           # 엔트리 포인트
```

## Common Commands

```bash
yarn dev            # 개발 서버 (vite, 기본 포트 5173)
yarn start          # = yarn dev
yarn build          # 프로덕션 빌드 (vite build → build/)
yarn preview        # 빌드 미리보기
yarn lint           # ESLint 실행 (인자로 파일/경로 전달)
yarn test:smoke     # Playwright smoke 테스트
yarn test:e2e       # Playwright e2e 테스트
yarn test:visual    # Playwright 시각 회귀
```

## Key Files

- `src/app/fuse-configs/routesConfig.js` - 라우팅 설정
- `src/app/services/camilleRiotAuthService/` - 인증 서비스
- `src/app/services/camilleAxios.js` - Axios API 클라이언트
- `src/app/main/ranking/RankingTable.js` - 랭킹 테이블 (티어 시스템)
- `src/app/store/` - Redux store 설정

## Architecture Notes

### State Management
- Redux를 사용한 중앙집중식 상태 관리
- 각 feature 모듈(ranking, myinfo)은 자체 Redux slice 보유
- Thunk 미들웨어로 비동기 API 호출 처리

### API Integration
- `camilleAxios`를 통한 백엔드 통신 (`src/app/utility/camilleAxios.js`)
- 환경변수 `VITE_CAMILLE_HOST`로 API 엔드포인트 설정 (`import.meta.env.VITE_CAMILLE_HOST`)
- Discord JWT 토큰을 `Authorization: Bearer ...` 헤더로 자동 추가
- Riot puuid를 `Puuid` 헤더로 자동 추가
- 401(JWT 만료) 시 자동 로그아웃 + `/login` 리다이렉트
- 5xx 에러 시 `/maintenance` 리다이렉트 (단 `silentError: true` 옵션 시 호출자가 처리)

### Ranking System
- 레이팅 점수를 LoL 티어로 변환 (IRON → CHALLENGER)
- LP(League Points) 계산 로직 포함
- 티어 엠블럼 이미지 표시

### 레이팅 표시 규칙 (필수)
- **레이팅 원시 숫자(예: 512)는 절대 화면에 표시하지 않는다.** 반드시 티어로 환산해서 보여준다.
  - 티어 라벨: `tournamentUtils`의 `getTierName` / `getTierLabel`("GOLD II") / `getTierShortLabel`("G2"), 엠블럼: `getTierEmblemUrl`
- **점수 증감(레이팅 delta)은 LP로 환산해 표시한다.** 환산 배수는 `4` (레이팅 1 = 4 LP). `RankingTable.js`의 `formatRatingChange`(`val * 4`), `getTierPoint` 참고.

## Code Style

- **ESLint**: Airbnb 기반 (`.eslintrc`)
- **Prettier**: 탭 사용, 싱글 쿼트, printWidth 120
- **Import**: `src/` 기준 절대 경로 + alias (`@fuse`, `@history`, `@lodash`, `app`, `styles`)
- **JSX**: `.js` 파일에서도 JSX 작성 (vite의 `jsx-in-js` 플러그인이 처리)
- **makeStyles**: `tss-react/mui`의 `makeStyles()(...)` 패턴. JSS의 `$ruleName` 참조는 미지원이라 애니메이션은 `@emotion/react`의 `keyframes` 헬퍼 사용

## Environment Variables

Vite 빌드라 `VITE_` 접두어가 붙은 것만 클라이언트에 노출됨.

```
VITE_CAMILLE_HOST=<백엔드 API URL, 예: https://zeroboom.lol>
VITE_RIOT_DATA_VERSION=<Riot Data Dragon 버전>
VITE_SENTRY_DSN=<Sentry DSN>
```

코드에서는 `import.meta.env.VITE_XXX`로 접근 (옛날 `process.env.REACT_APP_XXX` 아님).

## Development Notes

- Fuse 프레임워크 기반 레이아웃 시스템
- Discord OAuth 로그인 → JWT를 `localStorage.camille_discord_token`에 저장
- Riot puuid는 `localStorage.camille_riot_puuid`에 저장
- 그룹 어드민 여부는 `state.auth.user.reprGroup.isAdmin`
- 디스코드 ID는 `state.auth.user.data.discordUser.discordId`

## CI/CD 주의사항 (Vercel)

- 배포는 `yarn build` → `vite build` 결과(`build/`)를 Vercel이 호스팅
- Vite 빌드 파이프라인엔 ESLint 플러그인이 연결돼 있지 **않음** → ESLint 경고로 빌드가 깨지진 않는다 (옛 CRA 시절 규칙)
- 그래도 코드 정합성을 위해 미사용 import/변수, console.log는 제거하고 PR 올린다
- 이모지에는 a11y 속성 부여 (`<span role="img" aria-label="trophy">🏆</span>`)
- 빌드 사전 검증이 필요하면 `node`로 esbuild 호출해 syntax만 확인 가능 (vite와 같은 transform 사용)
