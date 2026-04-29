---
globs: "**/*.js,**/*.jsx"
---

# 디자인 일관성 가이드

새 컴포넌트/다이얼로그 만들 때 색상·border-radius·shadow를 임의로 정하지 말 것.
**기존 컴포넌트(특히 `MyInfo.js`)의 스타일을 그대로 베껴 쓴다.**

## 컬러 토큰 (필수)

- 메인 시안 `#00d4ff`, 보조 시안 `#0099cc` / `#0066ff`
- 배경 그라데이션:
  - 다이얼로그/카드: `linear-gradient(135deg, #1a1a2e 0%, #0f0f1a 100%)`
  - 섹션/패널: `linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)`
- 위험(삭제) `#ff6b6b`
- 성공(스낵) `#51cf66`, 좋음 `#00ff7f`
- 경고/명예 골드 `#ffd700`
- 핑크 좋아요 `#ff6b9a`
- 텍스트:
  - 본문 `rgba(255, 255, 255, 0.9)` ~ `0.92`
  - 보조/메타 `rgba(255, 255, 255, 0.4)` ~ `0.6`

새로운 색은 가급적 만들지 말고 위에서 고른다. 꼭 필요하면 cyan 계열 알파만 조정.

## 폰트

- 본문/한글: `'Noto Sans KR', sans-serif`
- 큰 타이틀/숫자: `'Rajdhani', 'Noto Sans KR', sans-serif`
- 한글 제목도 Rajdhani fallback 패턴 그대로 사용 (영문 숫자가 자연스럽게 스타일링됨)

## 다이얼로그 (메인 / cyan 톤)

`MyInfo.js`의 `listDialog` 스타일을 표준으로 본다. 새 다이얼로그 만들 땐 아래 골격을 따른다.

```js
dialogPaper: {
  background: 'linear-gradient(135deg, #1a1a2e 0%, #0f0f1a 100%)',
  color: '#fff',
  border: '1px solid rgba(0, 212, 255, 0.25)',
  borderRadius: '20px !important',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5), 0 0 60px rgba(0, 212, 255, 0.08)',
  overflow: 'hidden',
  position: 'relative',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0, left: 0, right: 0, height: 1,
    background: 'linear-gradient(90deg, transparent, rgba(0, 212, 255, 0.5), transparent)'
  }
}
```

타이틀(필요하면 `<div>`로 직접 렌더, `<DialogTitle>` 안 써도 됨):

```js
dialogTitle: {
  fontFamily: '"Rajdhani", "Noto Sans KR", sans-serif',
  fontSize: '2rem',
  fontWeight: 700,
  color: '#00d4ff',
  letterSpacing: '0.05em',
  textTransform: 'uppercase',
  padding: '24px 28px 4px',
  textShadow: '0 0 20px rgba(0, 212, 255, 0.3)'
}
```

서브타이틀(설명/카운트):

```js
dialogSubtitle: {
  fontFamily: '"Noto Sans KR", sans-serif',
  fontSize: '1.2rem',
  color: 'rgba(255, 255, 255, 0.4)',
  padding: '0 28px 12px'
}
```

콘텐츠/액션 패딩은 가로 `28px`로 통일:

```js
dialogContent: { padding: '8px 28px 20px !important' }
dialogActions: { padding: '12px 28px 24px' }
```

취소 버튼(outline → cyan hover):

```js
cancelBtn: {
  color: 'rgba(255, 255, 255, 0.5)',
  border: '1px solid rgba(255, 255, 255, 0.15)',
  borderRadius: 10,
  padding: '8px 22px',
  fontFamily: '"Noto Sans KR", sans-serif',
  fontSize: '1.2rem',
  textTransform: 'none',
  '&:hover': {
    color: '#00d4ff',
    borderColor: 'rgba(0, 212, 255, 0.4)',
    background: 'rgba(0, 212, 255, 0.08)'
  }
}
```

기본/저장 버튼(cyan gradient + cyan box-shadow):

```js
saveBtn: {
  background: 'linear-gradient(135deg, #00d4ff 0%, #0099cc 100%)',
  color: '#000',
  fontFamily: '"Noto Sans KR", sans-serif',
  fontWeight: 700,
  fontSize: '1.2rem',
  padding: '8px 26px',
  borderRadius: 10,
  textTransform: 'none',
  boxShadow: '0 4px 18px rgba(0, 212, 255, 0.25)',
  '&:hover': {
    background: 'linear-gradient(135deg, #00bce0 0%, #0088bb 100%)',
    boxShadow: '0 6px 22px rgba(0, 212, 255, 0.4)'
  },
  '&.Mui-disabled': {
    background: 'rgba(255, 255, 255, 0.1)',
    color: 'rgba(255, 255, 255, 0.3)',
    boxShadow: 'none'
  }
}
```

## 다이얼로그 (destructive / 삭제)

삭제 확인은 가벼운 별도 패턴이다. `MyInfo.js`의 부캐 해제 다이얼로그를 표준으로 본다.

- 페이퍼: 같은 그라데이션 배경, 다만 border `1px solid rgba(255, 107, 107, 0.3)`, borderRadius `16`
- `<DialogTitle>` 그대로 사용, 폰트만 `Noto Sans KR`
- 본문: `DialogContentText`, color `rgba(255, 255, 255, 0.7)`
- 취소: 회색 텍스트 버튼 (`rgba(255, 255, 255, 0.6)`)
- 확정: 빨간 텍스트 버튼 `#ff6b6b`, fontWeight 700

cyan 메인 다이얼로그를 만들지, 이 destructive 패턴을 만들지 헷갈리면:
**파괴적 액션 확인용 → destructive 패턴, 그 외 입력/표시용 → cyan 메인 패턴.**

## 섹션/카드 공통

- 섹션 컨테이너 borderRadius `16` ~ `20`
- 카드 내부 패널 borderRadius `12` ~ `14`
- 모바일 (`theme.breakpoints.down('sm')`)에서 padding/borderRadius 살짝 줄이기
- 섹션 타이틀에 `::before`로 4px 폭 cyan 세로 바 (`linear-gradient(180deg, #00d4ff, #0066ff)`) 박는 패턴 재사용

## 스낵바

```js
snackSuccess: {
  '& .MuiSnackbarContent-root': {
    background: '#51cf66',
    color: '#000',
    fontFamily: '"Noto Sans KR", sans-serif',
    fontWeight: 600
  }
}
snackError: {
  '& .MuiSnackbarContent-root': {
    background: '#ff6b6b',
    color: '#fff',
    fontFamily: '"Noto Sans KR", sans-serif',
    fontWeight: 600
  }
}
```

## 추가 원칙

- **기존 컴포넌트의 useStyles를 먼저 보고 베껴라**. 비슷한 모양이면 같은 토큰을 쓴다.
- 새 색상/그림자/border-radius를 즉흥적으로 도입하지 않는다.
- 입력 필드(`TextField`)도 위 cyan 톤(`focus`/`hover` 색)으로 통일. `MyInfo.js`의 `subAccountInput` 또는 `Guestbook.js`의 `textField` 참고.
- 한 페이지 안에서 같은 종류의 다이얼로그는 무조건 같은 스타일이어야 한다. 디자인 차이가 의도였다면 코멘트로 이유 명시.
