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
