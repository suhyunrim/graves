# 진입(fade-in) 애니메이션 가이드

새 컨텐츠(섹션/카드/타이틀/목록 등)를 추가할 때 **진입 애니메이션을 빠뜨리지 않기 위한 규칙**.
과거에 새 컨텐츠마다 `animation/opacity/animationDelay`를 손으로 붙이다 누락되는 일이 반복됐다.

## 원칙: 손으로 붙이지 말고 공통 컴포넌트를 쓴다

`src/app/main/components/Reveal.js`의 `RevealGroup` / `Reveal`을 사용한다.

### 여러 자식이 있는 컨테이너 → `<RevealGroup>`

기존 컨테이너 `div`를 그대로 `RevealGroup`으로 바꾸면, **직계 자식들이 자동으로 staggered fade-in** 된다. 자식을 새로 추가해도 자동으로 애니가 적용되므로 누락이 구조적으로 불가능하다.

```jsx
// before
<div className={classes.cardsGrid}>
  <div className={classes.card}>...</div>
  <div className={classes.card}>...</div>   // 새 카드 추가 시 애니 누락되곤 했음
</div>

// after
<RevealGroup className={classes.cardsGrid}>
  <div className={classes.card}>...</div>
  <div className={classes.card}>...</div>   // 자동으로 순차 fade-in
</RevealGroup>
```

- `className`/`style`/기타 props는 그대로 전달된다(레이아웃 동일, 래퍼 div가 기존 컨테이너를 대체).
- 자식에 추가 래퍼를 두지 않고 `cloneElement`로 클래스/딜레이만 주입하므로 grid/flex가 깨지지 않는다.
- stagger 간격은 `step`(기본 0.06s)으로 조절.

### 단일 요소 → `<Reveal>`

```jsx
<Reveal delay={0.05}>
  <div className={classes.sectionTitle}>내전 포지션 승률</div>
</Reveal>
```

## 하지 말 것

- **keyframes를 새 파일에서 다시 정의하지 말 것.** 필요하면 `Reveal.js`의 `fadeInUp`/`fadeIn`을 import한다.
- 새 컨텐츠에 `animation: ... opacity: 0 ...`를 직접 makeStyles로 박지 말 것(누락의 원인). 위 컴포넌트를 쓴다.
- 기존에 개별 애니가 박혀 있던 곳은 수정할 일이 생기면 `RevealGroup`으로 점진적으로 통일한다(한 번에 전체 교체는 불필요).

## 체크리스트 (새 섹션/카드/목록 추가 시)

- [ ] 진입 애니가 필요한 컨테이너인가? → `RevealGroup`으로 감쌌는가?
- [ ] 단일 타이틀/요소인가? → `Reveal`로 감쌌는가?
- [ ] keyframes를 새로 정의하지 않고 공통 것을 썼는가?
