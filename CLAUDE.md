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

- **Frontend**: React 16.13.1, React Router 5.1.2
- **State Management**: Redux + Redux Thunk
- **UI Framework**: Material-UI 4.x
- **Styling**: Tailwind CSS 1.2.0, JSS, Styled Components
- **HTTP Client**: Axios
- **Authentication**: Auth0 Lock, JWT
- **Charts**: Chart.js, React ChartJS 2
- **Build Tool**: Create React App (react-scripts 3.4.1)

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
│   ├── main/           # 주요 기능 모듈
│   │   ├── login/      # 로그인 페이지
│   │   ├── myinfo/     # 내 정보 페이지
│   │   └── ranking/    # 랭킹 페이지
│   ├── services/       # API 서비스 (Camille Riot)
│   ├── store/          # 전역 Redux store
│   └── utility/        # 헬퍼 유틸리티
├── styles/             # CSS/Tailwind 스타일
├── App.js              # 루트 컴포넌트
└── index.js            # 엔트리 포인트
```

## Common Commands

```bash
yarn start          # 개발 서버 실행 (포트 3000)
yarn build          # 프로덕션 빌드
yarn lint           # ESLint 실행
yarn test           # 테스트 실행
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
- `camilleAxios`를 통한 백엔드 통신
- 환경변수 `REACT_APP_CAMILLE_HOST`로 API 엔드포인트 설정
- Riot 토큰 기반 인증 헤더 자동 추가

### Ranking System
- 레이팅 점수를 LoL 티어로 변환 (IRON → CHALLENGER)
- LP(League Points) 계산 로직 포함
- 티어 엠블럼 이미지 표시

## Code Style

- **ESLint**: Airbnb 규칙 기반
- **Prettier**: 탭 사용, 싱글 쿼트, printWidth 120
- **Import**: `src/` 기준 절대 경로 사용 가능 (jsconfig.json)

## Environment Variables

```
REACT_APP_CAMILLE_HOST=<백엔드 API URL>
```

## Development Notes

- Fuse 프레임워크 기반 레이아웃 시스템 사용
- Material-UI 테마 커스터마이징 적용
- IE 11 지원을 위한 폴리필 포함
- Docker 배포 지원 (Dockerfile 포함)

## CI/CD 주의사항 (Vercel) - 중요!!

### ESLint 경고 = 빌드 실패
Vercel은 `CI=true` 환경에서 빌드하므로 **ESLint 경고가 빌드 에러로 처리됨**.
**코드 수정 시 ESLint 규칙을 반드시 준수해야 함!!**

### 코드 수정 시 필수 체크리스트 (no-unused-vars)

```jsx
// ❌ 빌드 실패 - 사용하지 않는 변수/함수
const [value, setValue] = useState(0);  // setValue를 사용하지 않으면 에러
import { foo, bar } from 'module';      // bar를 사용하지 않으면 에러
const unused = 'test';                   // 사용하지 않는 변수 에러

// ✅ 올바른 사용
const [value] = useState(0);            // setter가 필요없으면 생략
const value = 0;                         // 변경이 필요없으면 상수로
import { foo } from 'module';           // 필요한 것만 import
```

### 이모지 접근성 필수 (jsx-a11y/accessible-emoji)
이모지 사용 시 반드시 접근성 속성을 추가해야 함:

```jsx
// ❌ 빌드 실패
<span>🏆</span>
<div className={classes.emoji}>🔥</div>

// ✅ 올바른 사용
<span role="img" aria-label="trophy">🏆</span>
<span role="img" aria-label="fire" className={classes.emoji}>🔥</span>
```

### 기타 ESLint 규칙
- 사용하지 않는 import 제거
- 사용하지 않는 변수/함수 제거 (useState setter 포함!)
- `console.log` 제거 (필요시 주석 처리)
- 함수나 변수를 제거할 때 관련 참조도 모두 제거
