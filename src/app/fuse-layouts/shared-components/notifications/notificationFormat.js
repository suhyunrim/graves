import { formatDistanceToNow, parseISO } from 'date-fns';
import { ko } from 'date-fns/locale';

export function formatRelative(iso) {
	if (!iso) return '';
	try {
		const date = typeof iso === 'string' ? parseISO(iso) : iso;
		return formatDistanceToNow(date, { addSuffix: true, locale: ko });
	} catch (e) {
		return '';
	}
}

function pickActorName(group) {
	if (group.latestActorName) return group.latestActorName;
	const a = group.actors?.[0];
	if (!a) return '누군가';
	return a.name || a.displayName || a.summonerName || '누군가';
}

function actorsLabel(group) {
	const main = pickActorName(group);
	const extra = Math.max(0, (group.count || 1) - 1);
	if (extra <= 0) return `${main}님`;
	if (extra === 1 && group.actors?.[1]) {
		const second = group.actors[1].name || group.actors[1].displayName || group.actors[1].summonerName;
		if (second) return `${main}, ${second}님`;
	}
	return `${main}님 외 ${extra}명`;
}

export function formatMessage(group) {
	const payload = group.latestPayload || {};
	const actors = actorsLabel(group);

	switch (group.type) {
		case 'guestbook_comment':
		case 'guestbook_reply': {
			const action = group.type === 'guestbook_comment'
				? '내 방명록에 글을 남겼어요'
				: '내 댓글에 답글을 달았어요';
			const preview = payload.textPreview || payload.commentPreview;
			const head = `${actors}이 ${action}`;
			return preview ? `${head}: ${preview}` : head;
		}
		case 'guestbook_like':
			return `${actors}이 내 댓글을 좋아해요`;
		case 'challenge_end': {
			const name = payload.challengeName || payload.name || '챌린지';
			const rank = payload.rank ?? payload.finalRank;
			const total = payload.totalParticipants ?? payload.total ?? payload.participants;
			if (rank != null && total != null) {
				return `'${name}' 종료 — 최종 ${rank}등 / 전체 ${total}명`;
			}
			return `'${name}' 종료`;
		}
		case 'achievement_unlock': {
			const name = payload.achievementName || payload.name || '새 업적';
			return `🏆 '${name}' 업적을 달성했어요`;
		}
		case 'season_end': {
			const name = payload.seasonName || payload.name || '시즌';
			const rank = payload.rank ?? payload.finalRank;
			const rating = payload.rating ?? payload.finalRating;
			if (rank != null && rating != null) {
				return `${name}이 종료됐어요. 최종 ${rank}등 / 레이팅 ${rating}`;
			}
			return `${name}이 종료됐어요`;
		}
		default:
			return '새 알림이 도착했어요';
	}
}

export function getNavigationPath(group, myPuuid) {
	const payload = group.latestPayload || {};
	switch (group.type) {
		case 'guestbook_comment':
			return '/myinfo';
		case 'guestbook_reply':
		case 'guestbook_like': {
			const profilePuuid = payload.profilePuuid || payload.ownerPuuid;
			if (profilePuuid && profilePuuid !== myPuuid) {
				return `/userinfo/${profilePuuid}`;
			}
			return '/myinfo';
		}
		case 'challenge_end': {
			const id = payload.challengeId || payload.id;
			return id ? `/challenge/${id}` : '/challenge';
		}
		case 'achievement_unlock':
			return myPuuid ? `/achievement/${myPuuid}` : '/achievement';
		case 'season_end':
			return '/dashboard';
		default:
			return '/dashboard';
	}
}

export function getActorAvatar(group) {
	const a = group.actors?.[0];
	if (!a) return null;
	return a.photoURL || a.avatar || a.profileImage || null;
}

export function getActorInitial(group) {
	const name = pickActorName(group);
	return (name && name[0]) || '?';
}
