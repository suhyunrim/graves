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
	return a.name || '누군가';
}

function actorsLabel(group) {
	const main = pickActorName(group);
	const extra = Math.max(0, (group.count || 1) - 1);
	if (extra <= 0) return `${main}님`;
	if (extra === 1 && group.actors?.[1]?.name) {
		return `${main}, ${group.actors[1].name}님`;
	}
	return `${main}님 외 ${extra}명`;
}

export function formatMessage(group) {
	const payload = group.latestPayload || {};
	const actors = actorsLabel(group);

	switch (group.type) {
		case 'guestbook_comment': {
			const head = `${actors}이 방명록에 글을 남겼어요`;
			return payload.textPreview ? `${head}: ${payload.textPreview}` : head;
		}
		case 'guestbook_reply': {
			const head = `${actors}이 내 댓글에 답글을 달았어요`;
			return payload.textPreview ? `${head}: ${payload.textPreview}` : head;
		}
		case 'guestbook_like': {
			const target = payload.isReply ? '답글' : '댓글';
			return `${actors}이 내 ${target}을 좋아해요`;
		}
		case 'challenge_end': {
			const name = payload.challengeTitle || '챌린지';
			const rank = payload.finalRank;
			const total = payload.totalParticipants;
			if (rank != null && total != null) {
				return `'${name}' 챌린지가 종료됐어요. 최종 ${rank}등 / 전체 ${total}명`;
			}
			return `'${name}' 챌린지가 종료됐어요`;
		}
		case 'achievement_unlock': {
			const emoji = payload.achievementEmoji || '🏆';
			const name = payload.achievementName || '새 업적';
			return `${emoji} '${name}' 업적을 달성했어요`;
		}
		case 'season_end': {
			const from = payload.fromSeason;
			const rank = payload.finalRank;
			const rating = payload.finalRating;
			if (from != null && rank != null && rating != null) {
				return `시즌 ${from}이 종료됐어요. 최종 ${rank}등 / 레이팅 ${rating}`;
			}
			return '시즌이 종료됐어요';
		}
		default:
			return '새 알림이 도착했어요';
	}
}

export function getNavigationPath(group, myPuuid) {
	const payload = group.latestPayload || {};
	switch (group.type) {
		case 'guestbook_comment':
		case 'guestbook_reply':
		case 'guestbook_like': {
			const profilePuuid = payload.profilePuuid;
			const commentId = payload.commentId;
			const hash = commentId != null ? `#comment-${commentId}` : '';
			if (profilePuuid && profilePuuid !== myPuuid) {
				return `/userinfo/${profilePuuid}${hash}`;
			}
			return `/myinfo${hash}`;
		}
		case 'challenge_end': {
			const id = payload.challengeId;
			return id ? `/challenge/${id}` : '/challenge';
		}
		case 'achievement_unlock':
			return myPuuid ? `/achievement/${myPuuid}` : '/achievement';
		case 'season_end': {
			const from = payload.fromSeason;
			return from != null ? `/dashboard?season=${from}` : '/dashboard';
		}
		default:
			return '/dashboard';
	}
}

export function getActorAvatar(group) {
	const a = group.actors?.[0];
	if (!a) return null;
	return a.avatarUrl || null;
}

export function getActorInitial(group) {
	const name = pickActorName(group);
	return (name && name[0]) || '?';
}

export function getPrimaryActorProfile(group) {
	const a = group.actors?.[0];
	if (!a || !a.puuid) return null;
	return { puuid: a.puuid, name: a.name };
}
