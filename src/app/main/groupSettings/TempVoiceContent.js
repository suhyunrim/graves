import React, { useEffect, useState } from 'react';
import {
	Button,
	TextField,
	Dialog,
	DialogTitle,
	DialogContent,
	DialogContentText,
	DialogActions,
	Chip,
	useMediaQuery
} from '@material-ui/core';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import FuseLoading from '@fuse/core/FuseLoading';
import { useDispatch, useSelector } from 'react-redux';
import * as Actions from './store/actions';

const useStyles = makeStyles(theme => ({
	root: {
		padding: '24px 28px',
		[theme.breakpoints.down('sm')]: {
			padding: '16px 12px'
		}
	},
	noAdmin: {
		display: 'flex',
		justifyContent: 'center',
		alignItems: 'center',
		minHeight: 300,
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.6rem',
		color: 'rgba(255, 255, 255, 0.5)'
	},
	categoryGroup: {
		marginBottom: 28
	},
	categoryTitle: {
		fontFamily: '"Rajdhani", "Noto Sans KR", sans-serif',
		fontWeight: 700,
		fontSize: '1.6rem',
		color: 'rgba(0, 212, 255, 0.9)',
		letterSpacing: '0.05em',
		marginBottom: 12,
		paddingBottom: 8,
		borderBottom: '1px solid rgba(0, 212, 255, 0.15)'
	},
	channelList: {
		display: 'flex',
		flexDirection: 'column',
		gap: 10
	},
	channelCard: {
		borderRadius: 14,
		background: 'rgba(255, 255, 255, 0.03)',
		border: '1px solid rgba(255, 255, 255, 0.06)',
		padding: '16px 20px',
		transition: 'background 0.2s ease, border-color 0.2s ease',
		'&:hover': {
			background: 'rgba(255, 255, 255, 0.05)'
		},
		[theme.breakpoints.down('sm')]: {
			padding: '14px 14px'
		}
	},
	channelCardActive: {
		borderColor: 'rgba(0, 212, 255, 0.4)',
		background: 'rgba(0, 212, 255, 0.05)'
	},
	channelHeader: {
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'space-between',
		gap: 12,
		[theme.breakpoints.down('sm')]: {
			flexDirection: 'column',
			alignItems: 'flex-start',
			gap: 8
		}
	},
	channelName: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.35rem',
		fontWeight: 600,
		color: '#fff',
		display: 'flex',
		alignItems: 'center',
		gap: 10
	},
	generatorChip: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1rem',
		fontWeight: 600,
		background: 'rgba(0, 212, 255, 0.15)',
		color: '#00d4ff',
		border: '1px solid rgba(0, 212, 255, 0.3)'
	},
	channelActions: {
		display: 'flex',
		gap: 8,
		[theme.breakpoints.down('sm')]: {
			width: '100%'
		}
	},
	settingsBtn: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.1rem',
		fontWeight: 600,
		borderRadius: 10,
		padding: '4px 16px',
		textTransform: 'none',
		background: 'rgba(0, 212, 255, 0.15)',
		color: '#00d4ff',
		border: '1px solid rgba(0, 212, 255, 0.3)',
		'&:hover': {
			background: 'rgba(0, 212, 255, 0.3)'
		},
		[theme.breakpoints.down('sm')]: {
			flex: 1
		}
	},
	removeBtn: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.1rem',
		fontWeight: 600,
		borderRadius: 10,
		padding: '4px 16px',
		textTransform: 'none',
		background: 'rgba(255, 107, 107, 0.15)',
		color: '#ff6b6b',
		border: '1px solid rgba(255, 107, 107, 0.3)',
		'&:hover': {
			background: 'rgba(255, 107, 107, 0.3)'
		},
		[theme.breakpoints.down('sm')]: {
			flex: 1
		}
	},
	generatorInfo: {
		marginTop: 12,
		padding: '12px 16px',
		borderRadius: 10,
		background: 'rgba(0, 212, 255, 0.03)',
		border: '1px solid rgba(0, 212, 255, 0.08)',
		display: 'flex',
		gap: 24,
		[theme.breakpoints.down('sm')]: {
			flexDirection: 'column',
			gap: 8
		}
	},
	infoLabel: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.1rem',
		color: 'rgba(255, 255, 255, 0.4)'
	},
	infoValue: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.2rem',
		color: 'rgba(255, 255, 255, 0.85)',
		marginLeft: 8
	},
	dialogPaper: {
		background: 'linear-gradient(135deg, #1a1a2e 0%, #0f0f1a 100%)',
		border: '1px solid rgba(0, 212, 255, 0.3)',
		borderRadius: 16,
		color: '#fff',
		minWidth: 400,
		[theme.breakpoints.down('sm')]: {
			minWidth: 'auto',
			margin: 16
		}
	},
	dialogTitle: {
		fontFamily: '"Rajdhani", "Noto Sans KR", sans-serif',
		fontWeight: 700,
		color: '#fff'
	},
	dialogText: {
		color: 'rgba(255, 255, 255, 0.7)'
	},
	formField: {
		marginBottom: 20
	},
	formLabel: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.2rem',
		fontWeight: 600,
		color: 'rgba(255, 255, 255, 0.8)',
		marginBottom: 8,
		display: 'block'
	},
	formHint: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1rem',
		color: 'rgba(255, 255, 255, 0.4)',
		marginTop: 4
	},
	textField: {
		'& .MuiInputBase-root': {
			fontFamily: '"Noto Sans KR", sans-serif',
			fontSize: '1.2rem',
			color: '#fff',
			background: 'rgba(255, 255, 255, 0.05)',
			borderRadius: 8
		},
		'& .MuiOutlinedInput-notchedOutline': {
			borderColor: 'rgba(255, 255, 255, 0.15)'
		},
		'& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline': {
			borderColor: 'rgba(0, 212, 255, 0.4)'
		},
		'& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
			borderColor: 'rgba(0, 212, 255, 0.6)'
		}
	},
	placeholderChips: {
		display: 'flex',
		gap: 6,
		marginTop: 6,
		flexWrap: 'wrap'
	},
	placeholderChip: {
		fontFamily: '"Noto Sans KR", monospace',
		fontSize: '0.95rem',
		background: 'rgba(255, 255, 255, 0.08)',
		color: 'rgba(255, 255, 255, 0.6)',
		border: '1px solid rgba(255, 255, 255, 0.12)',
		cursor: 'pointer',
		'&:hover': {
			background: 'rgba(0, 212, 255, 0.15)',
			color: '#00d4ff'
		}
	},
	emptyState: {
		textAlign: 'center',
		padding: '60px 20px',
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.4rem',
		color: 'rgba(255, 255, 255, 0.4)'
	}
}));

function TempVoiceContent() {
	const classes = useStyles();
	const dispatch = useDispatch();
	const theme = useTheme();
	const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
	const user = useSelector(state => state.auth.user);
	const { voiceChannels, generators, loading } = useSelector(({ GroupSettings }) => GroupSettings.tempVoice);

	const [editDialog, setEditDialog] = useState(null);
	const [deleteDialog, setDeleteDialog] = useState(null);
	const [formName, setFormName] = useState('{username}의 채널');
	const [formLimit, setFormLimit] = useState(0);

	const groupId = user?.reprGroup?.groupId;
	const isAdmin = user?.reprGroup?.isAdmin;

	useEffect(() => {
		if (groupId && isAdmin) {
			dispatch(Actions.getVoiceChannels(groupId));
			dispatch(Actions.getGenerators(groupId));
		}
	}, [dispatch, groupId, isAdmin]);

	if (!isAdmin) {
		return <div className={classes.noAdmin}>관리자 권한이 필요합니다.</div>;
	}

	if (loading) {
		return <FuseLoading />;
	}

	const generatorMap = {};
	generators.forEach(g => {
		generatorMap[g.channelId] = g;
	});

	// 카테고리별 그룹핑
	const categoryMap = {};
	voiceChannels.forEach(ch => {
		const catName = ch.categoryName || '기타';
		if (!categoryMap[catName]) {
			categoryMap[catName] = [];
		}
		categoryMap[catName].push(ch);
	});
	const categories = Object.entries(categoryMap);

	function openEditDialog(channel) {
		const gen = generatorMap[channel.id];
		setFormName(gen ? gen.defaultName : '{username}의 채널');
		setFormLimit(gen ? gen.defaultUserLimit : 0);
		setEditDialog(channel);
	}

	function handleSave() {
		if (!editDialog) return;
		dispatch(
			Actions.saveGenerator(groupId, {
				channelId: editDialog.id,
				defaultName: formName,
				defaultUserLimit: Number(formLimit) || 0
			})
		);
		setEditDialog(null);
	}

	function handleDelete() {
		if (!deleteDialog) return;
		dispatch(Actions.deleteGenerator(groupId, deleteDialog.id));
		setDeleteDialog(null);
	}

	function insertPlaceholder(placeholder) {
		setFormName(prev => prev + placeholder);
	}

	if (categories.length === 0) {
		return (
			<div className={classes.root}>
				<div className={classes.emptyState}>Discord 서버에 음성 채널이 없습니다.</div>
			</div>
		);
	}

	return (
		<div className={classes.root}>
			{categories.map(([catName, channels]) => (
				<div key={catName} className={classes.categoryGroup}>
					<div className={classes.categoryTitle}>{catName}</div>
					<div className={classes.channelList}>
						{channels.map(channel => {
							const gen = generatorMap[channel.id];
							const isGenerator = Boolean(gen);
							return (
								<div
									key={channel.id}
									className={`${classes.channelCard} ${isGenerator ? classes.channelCardActive : ''}`}
								>
									<div className={classes.channelHeader}>
										<div className={classes.channelName}>
											<span role="img" aria-label="speaker">
												{isMobile ? '' : ''}
											</span>
											{channel.name}
											{isGenerator && <Chip label="생성기" className={classes.generatorChip} size="small" />}
										</div>
										<div className={classes.channelActions}>
											<Button className={classes.settingsBtn} size="small" onClick={() => openEditDialog(channel)}>
												{isGenerator ? '수정' : '등록'}
											</Button>
											{isGenerator && (
												<Button className={classes.removeBtn} size="small" onClick={() => setDeleteDialog(channel)}>
													해제
												</Button>
											)}
										</div>
									</div>
									{isGenerator && (
										<div className={classes.generatorInfo}>
											<div>
												<span className={classes.infoLabel}>이름 패턴</span>
												<span className={classes.infoValue}>{gen.defaultName}</span>
											</div>
											<div>
												<span className={classes.infoLabel}>인원 제한</span>
												<span className={classes.infoValue}>
													{gen.defaultUserLimit === 0 ? '무제한' : `${gen.defaultUserLimit}명`}
												</span>
											</div>
										</div>
									)}
								</div>
							);
						})}
					</div>
				</div>
			))}

			{/* 등록/수정 다이얼로그 */}
			<Dialog
				open={Boolean(editDialog)}
				onClose={() => setEditDialog(null)}
				PaperProps={{ className: classes.dialogPaper }}
			>
				{editDialog && (
					<>
						<DialogTitle className={classes.dialogTitle}>
							{generatorMap[editDialog.id] ? '생성기 수정' : '생성기 등록'} - {editDialog.name}
						</DialogTitle>
						<DialogContent>
							<div className={classes.formField}>
								<span className={classes.formLabel}>이름 패턴</span>
								<TextField
									className={classes.textField}
									variant="outlined"
									size="small"
									fullWidth
									value={formName}
									onChange={e => setFormName(e.target.value)}
									placeholder="{username}의 채널"
								/>
								<div className={classes.placeholderChips}>
									<Chip
										className={classes.placeholderChip}
										label="{username}"
										size="small"
										onClick={() => insertPlaceholder('{username}')}
									/>
									<Chip
										className={classes.placeholderChip}
										label="{count}"
										size="small"
										onClick={() => insertPlaceholder('{count}')}
									/>
								</div>
								<div className={classes.formHint}>
									{'{username}'} = 유저 이름, {'{count}'} = 자동 번호
								</div>
							</div>
							<div className={classes.formField}>
								<span className={classes.formLabel}>인원 제한</span>
								<TextField
									className={classes.textField}
									variant="outlined"
									size="small"
									fullWidth
									type="number"
									value={formLimit}
									onChange={e => setFormLimit(e.target.value)}
									inputProps={{ min: 0 }}
								/>
								<div className={classes.formHint}>0 = 무제한</div>
							</div>
						</DialogContent>
						<DialogActions>
							<Button onClick={() => setEditDialog(null)} style={{ color: 'rgba(255,255,255,0.6)' }}>
								취소
							</Button>
							<Button onClick={handleSave} style={{ color: '#00d4ff' }}>
								{generatorMap[editDialog.id] ? '수정' : '등록'}
							</Button>
						</DialogActions>
					</>
				)}
			</Dialog>

			{/* 해제 확인 다이얼로그 */}
			<Dialog
				open={Boolean(deleteDialog)}
				onClose={() => setDeleteDialog(null)}
				PaperProps={{ className: classes.dialogPaper }}
			>
				{deleteDialog && (
					<>
						<DialogTitle className={classes.dialogTitle}>생성기 해제</DialogTitle>
						<DialogContent>
							<DialogContentText className={classes.dialogText}>
								"{deleteDialog.name}" 채널의 생성기를 해제하시겠습니까?
							</DialogContentText>
						</DialogContent>
						<DialogActions>
							<Button onClick={() => setDeleteDialog(null)} style={{ color: 'rgba(255,255,255,0.6)' }}>
								취소
							</Button>
							<Button onClick={handleDelete} style={{ color: '#ff6b6b' }}>
								해제
							</Button>
						</DialogActions>
					</>
				)}
			</Dialog>
		</div>
	);
}

export default TempVoiceContent;
