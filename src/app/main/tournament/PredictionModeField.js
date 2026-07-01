import React from 'react';
import { RadioGroup, FormControlLabel, Radio } from '@mui/material';
import { makeStyles } from 'tss-react/mui';

// 생성/수정 폼 공용 — 승부예측 방식(predictionMode) 선택 라디오.
const useStyles = makeStyles()(() => ({
	root: {
		marginBottom: 16
	},
	label: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.15rem',
		color: 'rgba(255, 255, 255, 0.6)',
		marginBottom: 6
	},
	group: {
		gap: 4
	},
	option: {
		alignItems: 'flex-start',
		margin: 0,
		padding: '8px 12px',
		borderRadius: 10,
		border: '1px solid rgba(255, 255, 255, 0.12)',
		transition: 'border-color 0.15s ease, background 0.15s ease',
		'& .MuiFormControlLabel-label': { width: '100%' }
	},
	optionSelected: {
		borderColor: 'rgba(0, 212, 255, 0.5)',
		background: 'rgba(0, 212, 255, 0.06)'
	},
	optionDisabled: {
		opacity: 0.5
	},
	radio: {
		color: 'rgba(255, 255, 255, 0.4)',
		paddingTop: 2,
		'&.Mui-checked': { color: '#00d4ff' }
	},
	optionTitle: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.2rem',
		fontWeight: 600,
		color: 'rgba(255, 255, 255, 0.9)'
	},
	optionDesc: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.05rem',
		color: 'rgba(255, 255, 255, 0.45)',
		marginTop: 2
	},
	note: {
		fontFamily: '"Noto Sans KR", sans-serif',
		fontSize: '1.05rem',
		color: 'rgba(255, 215, 0, 0.75)',
		marginTop: 6
	}
}));

const OPTIONS = [
	{
		value: 'bracket',
		title: '전체 대진 미리 예측',
		desc: '대회 시작 전 전체 브래킷을 한 번에 예측'
	},
	{
		value: 'rolling',
		title: '경기별 순차 예측',
		desc: '두 팀이 확정된 경기만, 시작 전까지 그때그때 예측'
	}
];

function PredictionModeField({ value, onChange, disabled = false, disabledReason }) {
	const { classes, cx } = useStyles();
	return (
		<div className={classes.root}>
			<div className={classes.label}>승부예측 방식</div>
			<RadioGroup
				className={classes.group}
				value={value}
				onChange={(e) => onChange(e.target.value)}
			>
				{OPTIONS.map((opt) => (
					<FormControlLabel
						key={opt.value}
						value={opt.value}
						disabled={disabled}
						className={cx(
							classes.option,
							value === opt.value && classes.optionSelected,
							disabled && classes.optionDisabled
						)}
						control={<Radio className={classes.radio} />}
						label={
							<>
								<div className={classes.optionTitle}>{opt.title}</div>
								<div className={classes.optionDesc}>{opt.desc}</div>
							</>
						}
					/>
				))}
			</RadioGroup>
			{disabled && disabledReason && <div className={classes.note}>{disabledReason}</div>}
		</div>
	);
}

export default PredictionModeField;
