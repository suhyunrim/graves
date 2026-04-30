import { makeStyles } from 'tss-react/mui';

// 표준 다이얼로그/팝업 스타일.
// .claude/rules/design-consistency.md, MyInfo.js 의 listDialog(메인 cyan)
// 와 부캐 해제 다이얼로그(destructive) 패턴을 그대로 따른다.
//
// 사용법 (MUI v9 — Paper 슬롯에 className 을 입히려면 slotProps 사용 필수.
// PaperProps={{ className }} 는 v9 에서 paper element 까지 className 이 전달되지 않는다):
//   const { classes: dialogClasses } = useDialogStyles();
//   <Dialog slotProps={{ paper: { className: dialogClasses.paperCyan } }}>
//     <DialogTitle className={dialogClasses.titleCyan}>...</DialogTitle>
//     ...
//     <DialogActions>
//       <Button className={dialogClasses.cancelBtn}>취소</Button>
//       <Button className={dialogClasses.saveBtn}>저장</Button>
//     </DialogActions>
//   </Dialog>
const useDialogStyles = makeStyles()(() => ({
	// 메인 cyan 패턴 — 입력/표시용 다이얼로그 페이퍼
	paperCyan: {
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
			top: 0,
			left: 0,
			right: 0,
			height: 1,
			background: 'linear-gradient(90deg, transparent, rgba(0, 212, 255, 0.5), transparent)'
		}
	},
	// Destructive 패턴 — 파괴적 액션 확인용 페이퍼
	paperDestructive: {
		background: 'linear-gradient(135deg, #1a1a2e 0%, #0f0f1a 100%)',
		color: '#fff',
		borderRadius: 16,
		border: '1px solid rgba(255, 107, 107, 0.3)'
	},
	// Menu(컨텍스트 메뉴)용 페이퍼 — 다이얼로그보다 가벼운 톤
	menuPaper: {
		background: 'linear-gradient(135deg, #1a1a2e 0%, #0f0f1a 100%)',
		border: '1px solid rgba(0, 212, 255, 0.25)',
		borderRadius: 12,
		color: '#fff',
		boxShadow: '0 6px 24px rgba(0, 0, 0, 0.5), 0 0 40px rgba(0, 212, 255, 0.06)'
	},
	// 메인 cyan 타이틀 — Rajdhani + cyan glow + uppercase
	titleCyan: {
		fontFamily: '"Rajdhani", "Noto Sans KR", sans-serif',
		fontSize: '2rem',
		fontWeight: 700,
		color: '#00d4ff',
		letterSpacing: '0.05em',
		textTransform: 'uppercase',
		padding: '24px 28px 4px',
		textShadow: '0 0 20px rgba(0, 212, 255, 0.3)'
	},
	// Destructive 타이틀 — Noto Sans KR (DialogTitle에 직접 입힘)
	titleDestructive: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontWeight: 700
	},
	// 메인 cyan 다이얼로그용 부제(설명/카운트)
	subtitle: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.2rem',
		color: 'rgba(255, 255, 255, 0.4)',
		padding: '0 28px 12px'
	},
	// 본문 텍스트 (DialogContentText 등)
	contentText: {
		color: 'rgba(255, 255, 255, 0.7)',
		fontFamily: '"Noto Sans KR", sans-serif'
	},
	// 가로 28px 패딩 컨텐트/액션 (메인 cyan 패턴 권장)
	contentPad: {
		padding: '8px 28px 20px !important'
	},
	actionsPad: {
		padding: '12px 28px 24px'
	},
	// 메인 cyan 패턴 — 회색 outline → cyan hover
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
	},
	// 메인 cyan 패턴 — cyan gradient 채움 버튼
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
	},
	// Destructive 패턴 — 회색 텍스트 취소
	destructiveCancelBtn: {
		color: 'rgba(255, 255, 255, 0.6)',
		fontFamily: '"Noto Sans KR", sans-serif'
	},
	// Destructive 패턴 — 빨강 텍스트 확정
	destructiveConfirmBtn: {
		color: '#ff6b6b',
		fontFamily: '"Noto Sans KR", sans-serif',
		fontWeight: 700
	}
}));

export default useDialogStyles;
