import FusePageSimple from '@fuse/core/FusePageSimple';
import { makeStyles } from '@material-ui/core/styles';
import { Typography } from '@material-ui/core';
import NewReleasesIcon from '@material-ui/icons/NewReleases';
import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import * as fuseActions from 'app/store/actions';
import axios from 'axios';
import { ReleaseNotesSkeleton } from 'app/main/components/SkeletonLoaders';

const STORAGE_KEY = 'graves_last_seen_version';

function compareVersions(a, b) {
	const pa = a.split('.').map(Number);
	const pb = b.split('.').map(Number);
	for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
		const na = pa[i] || 0;
		const nb = pb[i] || 0;
		if (na !== nb) return na - nb;
	}
	return 0;
}

const useStyles = makeStyles(theme => ({
	layoutRoot: {
		background: 'linear-gradient(180deg, #0f0f1a 0%, #1a1a2e 100%)',
		minHeight: '100vh'
	},
	headerRoot: {
		display: 'flex',
		flexDirection: 'column',
		width: '100%',
		padding: '24px 28px 20px',
		background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)'
	},
	title: {
		fontFamily: '"Rajdhani", "Noto Sans KR", sans-serif',
		fontWeight: 700,
		fontSize: '4rem',
		color: '#fff',
		textTransform: 'uppercase',
		letterSpacing: '0.15em',
		textShadow: '0 0 20px rgba(0, 212, 255, 0.5)',
		margin: 0,
		[theme.breakpoints.down('sm')]: {
			fontSize: '2.75rem'
		}
	},
	subtitle: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.6rem',
		color: 'rgba(255, 255, 255, 0.6)',
		letterSpacing: '0.05em',
		marginTop: 10,
		[theme.breakpoints.down('sm')]: {
			fontSize: '1.35rem'
		}
	},
	container: {
		padding: '28px',
		maxWidth: 900,
		margin: '0 auto',
		width: '100%'
	},
	releaseCard: {
		background: 'linear-gradient(135deg, #1a1a2e 0%, #0f0f1a 100%)',
		borderRadius: 20,
		border: '1px solid rgba(0, 212, 255, 0.2)',
		padding: '28px 32px',
		marginBottom: 20,
		transition: 'border-color 0.3s ease',
		'&:hover': {
			borderColor: 'rgba(0, 212, 255, 0.4)'
		}
	},
	releaseCardNew: {
		borderColor: 'rgba(0, 212, 255, 0.5)',
		boxShadow: '0 0 20px rgba(0, 212, 255, 0.1)'
	},
	releaseHeader: {
		display: 'flex',
		alignItems: 'center',
		gap: 12,
		marginBottom: 16,
		flexWrap: 'wrap'
	},
	versionBadge: {
		fontFamily: '"Rajdhani", sans-serif',
		fontSize: '1.6rem',
		fontWeight: 700,
		padding: '4px 14px',
		borderRadius: 10,
		background: 'rgba(0, 212, 255, 0.15)',
		color: '#00d4ff'
	},
	releaseTitle: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.8rem',
		fontWeight: 700,
		color: '#fff',
		flex: 1,
		minWidth: 0,
		[theme.breakpoints.down('sm')]: {
			flex: 'none',
			width: '100%',
			order: 10
		}
	},
	releaseDate: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.2rem',
		color: 'rgba(255, 255, 255, 0.4)'
	},
	newBadge: {
		display: 'flex',
		alignItems: 'center',
		gap: 4,
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.1rem',
		fontWeight: 600,
		padding: '3px 10px',
		borderRadius: 8,
		background: 'rgba(81, 207, 102, 0.15)',
		color: '#51cf66',
		border: '1px solid rgba(81, 207, 102, 0.3)'
	},
	changeList: {
		listStyle: 'none',
		padding: 0,
		margin: 0
	},
	changeItem: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.3rem',
		color: 'rgba(255, 255, 255, 0.8)',
		padding: '6px 0',
		paddingLeft: 20,
		position: 'relative',
		lineHeight: 1.6,
		'&::before': {
			content: '"•"',
			position: 'absolute',
			left: 0,
			color: '#00d4ff'
		}
	},
	emptyState: {
		display: 'flex',
		flexDirection: 'column',
		alignItems: 'center',
		justifyContent: 'center',
		padding: '80px 20px',
		textAlign: 'center'
	},
	emptyText: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.8rem',
		color: 'rgba(255, 255, 255, 0.4)'
	}
}));

function ReleaseNotes() {
	const classes = useStyles();
	const dispatch = useDispatch();
	const [releases, setReleases] = useState([]);
	const [loading, setLoading] = useState(true);
	const lastSeenVersion = localStorage.getItem(STORAGE_KEY);

	useEffect(() => {
		axios.get('/release-notes.json').then(response => {
			setReleases(response.data);
			setLoading(false);
			if (response.data.length > 0) {
				localStorage.setItem(STORAGE_KEY, response.data[0].version);
				dispatch(
					fuseActions.updateNavigationItem('release-notes-component', {
						badge: null
					})
				);
			}
		});
	}, [dispatch]);

	return (
		<FusePageSimple
			classes={{ root: classes.layoutRoot }}
			header={
				<div className={classes.headerRoot}>
					<Typography className={classes.title} variant="h4">
						Release Notes
					</Typography>
					<Typography className={classes.subtitle}>업데이트 내역</Typography>
				</div>
			}
			content={
				<div className={classes.container}>
					{loading ? (
						<ReleaseNotesSkeleton />
					) : releases.length > 0 ? (
						releases.map(release => {
							const isNew = lastSeenVersion && compareVersions(release.version, lastSeenVersion) > 0;
							return (
								<div key={release.version} className={`${classes.releaseCard} ${isNew ? classes.releaseCardNew : ''}`}>
									<div className={classes.releaseHeader}>
										<span className={classes.versionBadge}>v{release.version}</span>
										<span className={classes.releaseTitle}>{release.title}</span>
										{isNew && (
											<span className={classes.newBadge}>
												<NewReleasesIcon style={{ fontSize: '1.2rem' }} />
												NEW
											</span>
										)}
										<span className={classes.releaseDate}>{release.date}</span>
									</div>
									<ul className={classes.changeList}>
										{release.changes.map(change => (
											<li key={change} className={classes.changeItem}>
												{change}
											</li>
										))}
									</ul>
								</div>
							);
						})
					) : (
						<div className={classes.emptyState}>
							<div className={classes.emptyText}>릴리즈 노트가 없습니다</div>
						</div>
					)}
				</div>
			}
		/>
	);
}

export default ReleaseNotes;
