import React, { useCallback, useState } from 'react';
import camilleRiotAuthService from 'app/services/camilleRiotAuthService/camilleRiotAuthService';
import LoginRequiredDialog from './LoginRequiredDialog';

// 디스코드 로그인이 필요한 액션 호출 직전 게이트로 사용:
//   const { requireLogin, gate } = useDiscordLoginGate();
//   function handleSubmit() {
//     if (!requireLogin('승부예측')) return;
//     // ... 정상 로직
//   }
//   return (<>{...UI...}{gate}</>);
//
// 디스코드 토큰 보유 여부만 체크 (Riot puuid 만 있는 사용자도 미통과로 잡아냄).
export default function useDiscordLoginGate() {
	const [open, setOpen] = useState(false);
	const [actionLabel, setActionLabel] = useState('');

	const requireLogin = useCallback((label = '') => {
		if (camilleRiotAuthService.getDiscordToken()) return true;
		setActionLabel(label);
		setOpen(true);
		return false;
	}, []);

	const gate = (
		<LoginRequiredDialog
			open={open}
			onClose={() => setOpen(false)}
			actionLabel={actionLabel}
		/>
	);

	return { requireLogin, gate };
}
