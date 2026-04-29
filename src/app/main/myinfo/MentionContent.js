import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { makeStyles } from 'tss-react/mui';
import camilleRiotAuthService from 'app/services/camilleRiotAuthService';

const MENTION_REGEX = /<@([\w-]+)>/g;

const useStyles = makeStyles()(() => ({
	mention: {
		color: '#00d4ff',
		fontWeight: 600,
		cursor: 'pointer',
		textDecoration: 'none',
		'&:hover': {
			textDecoration: 'underline'
		}
	},
	mentionUnknown: {
		color: 'rgba(255, 255, 255, 0.4)',
		fontStyle: 'italic'
	}
}));

export function parseMentions(content) {
	const parts = [];
	if (!content) return parts;
	let lastIndex = 0;
	const re = new RegExp(MENTION_REGEX.source, 'g');
	let m = re.exec(content);
	while (m !== null) {
		if (m.index > lastIndex) {
			parts.push({ type: 'text', value: content.slice(lastIndex, m.index) });
		}
		parts.push({ type: 'mention', puuid: m[1] });
		lastIndex = m.index + m[0].length;
		m = re.exec(content);
	}
	if (lastIndex < content.length) {
		parts.push({ type: 'text', value: content.slice(lastIndex) });
	}
	return parts;
}

function MentionContent({ content, members }) {
	const { classes } = useStyles();
	const navigate = useNavigate();

	const memberByPuuid = useMemo(() => {
		const map = {};
		(members || []).forEach(m => {
			if (m && m.puuid) map[m.puuid] = m;
		});
		return map;
	}, [members]);

	const parts = useMemo(() => parseMentions(content), [content]);
	const myPuuid = camilleRiotAuthService.getPuuid();

	if (parts.length === 0) return null;

	return (
		<>
			{parts.map((p, i) => {
				if (p.type === 'text') {
					// eslint-disable-next-line react/no-array-index-key
					return <React.Fragment key={i}>{p.value}</React.Fragment>;
				}
				const member = memberByPuuid[p.puuid];
				if (!member) {
					return (
						// eslint-disable-next-line react/no-array-index-key
						<span key={i} className={classes.mentionUnknown}>@(알 수 없음)</span>
					);
				}
				const handleClick = e => {
					e.stopPropagation();
					if (member.puuid === myPuuid) navigate('/myinfo');
					else navigate(`/userinfo/${member.puuid}`);
				};
				return (
					<span
						// eslint-disable-next-line react/no-array-index-key
						key={i}
						role="link"
						tabIndex={0}
						className={classes.mention}
						onClick={handleClick}
						onKeyDown={e => {
							if (e.key === 'Enter' || e.key === ' ') handleClick(e);
						}}
					>
						@{member.name}
					</span>
				);
			})}
		</>
	);
}

export default MentionContent;
