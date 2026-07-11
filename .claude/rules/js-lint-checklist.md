---
globs: "**/*.js,**/*.jsx"
---

# JS 파일 수정 시 필수 ESLint 체크리스트

이 프로젝트는 Vercel CI에서 `CI=true`로 빌드하므로 **ESLint 경고 = 빌드 실패**이다.
`eslint --fix`는 prettier 포맷만 고치고 `no-unused-vars`는 자동 수정하지 않는다.

## 코드 작성/수정 완료 후 반드시 확인할 것

### 1. 미사용 import 확인
- import한 모듈/컴포넌트가 실제로 사용되는지 하나씩 확인
- 초기에 넣었다가 최종 코드에서 안 쓰게 된 것 주의
- 구조분해에서 안 쓰는 항목 제거 (예: `{ Button, Chip }` → Button 안 쓰면 `{ Chip }`)

### 2. 미사용 변수/함수 확인
- `const [value, setValue] = useState()` → setValue 안 쓰면 `const [value] = useState()`
- 선언만 하고 사용하지 않는 변수/함수 제거

### 3. 이모지 접근성
```jsx
// ❌ <span>🏆</span>
// ✅ <span role="img" aria-label="trophy">🏆</span>
```

### 4. console.log 제거
- 디버그용 console.log는 커밋 전에 반드시 제거
