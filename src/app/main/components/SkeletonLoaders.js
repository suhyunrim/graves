import React from 'react';
import Skeleton from '@material-ui/lab/Skeleton';
import { makeStyles } from '@material-ui/core/styles';

const useSkeletonStyles = makeStyles(() => ({
	'@keyframes shimmer': {
		'0%': { opacity: 0.3 },
		'50%': { opacity: 0.5 },
		'100%': { opacity: 0.3 }
	},
	// Dashboard
	dashboardContainer: {
		padding: '24px',
		maxWidth: 1400,
		margin: '0 auto'
	},
	dashboardMonthBadge: {
		display: 'inline-flex',
		alignItems: 'center',
		gap: 8,
		marginBottom: 24
	},
	dashboardGrid: {
		display: 'grid',
		gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
		gap: 20
	},
	dashboardCard: {
		borderRadius: 16,
		padding: 28,
		background: 'linear-gradient(135deg, #1a1a2e 0%, #121828 100%)',
		border: '1px solid rgba(255, 255, 255, 0.08)'
	},
	dashboardCardHeader: {
		display: 'flex',
		alignItems: 'center',
		gap: 12,
		marginBottom: 16
	},
	// Table
	tableContainer: {
		padding: '28px',
		maxWidth: 1400,
		margin: '0 auto',
		width: '100%'
	},
	tableWrapper: {
		background: 'linear-gradient(135deg, #1a1a2e 0%, #0f0f1a 100%)',
		borderRadius: 20,
		border: '1px solid rgba(0, 212, 255, 0.2)',
		overflow: 'hidden',
		padding: '16px 24px'
	},
	tableHeaderRow: {
		display: 'flex',
		gap: 24,
		padding: '12px 0',
		borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
		marginBottom: 8
	},
	tableRow: {
		display: 'flex',
		alignItems: 'center',
		gap: 24,
		padding: '14px 0',
		borderBottom: '1px solid rgba(255, 255, 255, 0.05)'
	},
	// MyInfo Profile
	profileContainer: {
		padding: '32px 24px',
		maxWidth: 1200,
		margin: '0 auto'
	},
	profileTop: {
		display: 'flex',
		gap: 32,
		marginBottom: 32,
		flexWrap: 'wrap'
	},
	profileCard: {
		flex: 1,
		minWidth: 280,
		borderRadius: 16,
		padding: 24,
		background: 'linear-gradient(135deg, #1a1a2e 0%, #121828 100%)',
		border: '1px solid rgba(255, 255, 255, 0.08)'
	},
	profileStatRow: {
		display: 'flex',
		gap: 16,
		marginTop: 16
	},
	// Achievement
	achievementGrid: {
		display: 'grid',
		gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
		gap: 16,
		padding: '24px'
	},
	achievementCard: {
		borderRadius: 12,
		padding: 20,
		background: 'rgba(255, 255, 255, 0.03)',
		border: '1px solid rgba(255, 255, 255, 0.08)'
	},
	// Match History
	matchRow: {
		display: 'flex',
		alignItems: 'center',
		gap: 16,
		padding: '16px 24px',
		borderBottom: '1px solid rgba(255, 255, 255, 0.05)'
	},
	matchTeams: {
		display: 'flex',
		gap: 8,
		flex: 1
	}
}));

const skeletonProps = {
	animation: 'wave',
	style: { backgroundColor: 'rgba(255, 255, 255, 0.08)' }
};

function DashboardSkeleton() {
	const classes = useSkeletonStyles();
	return (
		<div className={classes.dashboardContainer}>
			<div className={classes.dashboardMonthBadge}>
				<Skeleton
					{...skeletonProps}
					variant="rect"
					width={200}
					height={36}
					style={{ ...skeletonProps.style, borderRadius: 8 }}
				/>
			</div>
			<div className={classes.dashboardGrid}>
				{Array.from({ length: 10 }).map((_, i) => (
					<div key={i} className={classes.dashboardCard}>
						<div className={classes.dashboardCardHeader}>
							<Skeleton {...skeletonProps} variant="circle" width={48} height={48} />
							<div style={{ flex: 1 }}>
								<Skeleton {...skeletonProps} variant="text" width="60%" height={16} />
								<Skeleton
									{...skeletonProps}
									variant="text"
									width="40%"
									height={20}
									style={{ ...skeletonProps.style, marginTop: 6 }}
								/>
							</div>
						</div>
						<Skeleton
							{...skeletonProps}
							variant="text"
							width="50%"
							height={32}
							style={{ ...skeletonProps.style, marginBottom: 12 }}
						/>
						<Skeleton
							{...skeletonProps}
							variant="rect"
							width="70%"
							height={20}
							style={{ ...skeletonProps.style, borderRadius: 6 }}
						/>
					</div>
				))}
			</div>
		</div>
	);
}

function RankingTableSkeleton() {
	const classes = useSkeletonStyles();
	return (
		<div className={classes.tableContainer}>
			<div className={classes.tableWrapper}>
				<div className={classes.tableHeaderRow}>
					<Skeleton {...skeletonProps} variant="text" width={40} height={18} />
					<Skeleton {...skeletonProps} variant="text" width={100} height={18} />
					<Skeleton {...skeletonProps} variant="text" width={120} height={18} />
					<Skeleton {...skeletonProps} variant="text" width={50} height={18} />
					<Skeleton {...skeletonProps} variant="text" width={50} height={18} />
					<Skeleton {...skeletonProps} variant="text" width={50} height={18} />
					<Skeleton {...skeletonProps} variant="text" width={60} height={18} />
				</div>
				{Array.from({ length: 10 }).map((_, i) => (
					<div key={i} className={classes.tableRow}>
						<Skeleton {...skeletonProps} variant="text" width={40} height={24} />
						<Skeleton {...skeletonProps} variant="text" width={100} height={20} />
						<div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
							<Skeleton {...skeletonProps} variant="circle" width={40} height={40} />
							<div>
								<Skeleton {...skeletonProps} variant="text" width={80} height={16} />
								<Skeleton {...skeletonProps} variant="text" width={50} height={14} />
							</div>
						</div>
						<Skeleton {...skeletonProps} variant="text" width={40} height={20} />
						<Skeleton {...skeletonProps} variant="text" width={40} height={20} />
						<Skeleton {...skeletonProps} variant="text" width={40} height={20} />
						<Skeleton {...skeletonProps} variant="text" width={50} height={20} />
					</div>
				))}
			</div>
		</div>
	);
}

function MatchHistorySkeleton() {
	const classes = useSkeletonStyles();
	return (
		<div className={classes.tableContainer}>
			<div className={classes.tableWrapper}>
				{Array.from({ length: 8 }).map((_, i) => (
					<div key={i} className={classes.matchRow}>
						<Skeleton {...skeletonProps} variant="text" width={30} height={22} />
						<Skeleton
							{...skeletonProps}
							variant="rect"
							width={60}
							height={28}
							style={{ ...skeletonProps.style, borderRadius: 6 }}
						/>
						<div className={classes.matchTeams}>
							{Array.from({ length: 5 }).map((__, j) => (
								<Skeleton key={j} {...skeletonProps} variant="text" width={56} height={16} />
							))}
						</div>
						<Skeleton {...skeletonProps} variant="text" width={20} height={18} />
						<div className={classes.matchTeams}>
							{Array.from({ length: 5 }).map((__, j) => (
								<Skeleton key={j} {...skeletonProps} variant="text" width={56} height={16} />
							))}
						</div>
						<Skeleton {...skeletonProps} variant="text" width={80} height={16} />
					</div>
				))}
			</div>
		</div>
	);
}

function MyInfoSkeleton() {
	const classes = useSkeletonStyles();
	return (
		<div className={classes.profileContainer}>
			<div className={classes.profileTop}>
				<div className={classes.profileCard}>
					<div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
						<Skeleton {...skeletonProps} variant="circle" width={64} height={64} />
						<div>
							<Skeleton {...skeletonProps} variant="text" width={120} height={24} />
							<Skeleton
								{...skeletonProps}
								variant="text"
								width={80}
								height={16}
								style={{ ...skeletonProps.style, marginTop: 4 }}
							/>
						</div>
					</div>
					<div className={classes.profileStatRow}>
						<Skeleton
							{...skeletonProps}
							variant="rect"
							width="100%"
							height={60}
							style={{ ...skeletonProps.style, borderRadius: 8 }}
						/>
					</div>
				</div>
				<div className={classes.profileCard}>
					<Skeleton
						{...skeletonProps}
						variant="text"
						width="40%"
						height={20}
						style={{ ...skeletonProps.style, marginBottom: 16 }}
					/>
					<div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
						<Skeleton {...skeletonProps} variant="circle" width={56} height={56} />
						<div>
							<Skeleton {...skeletonProps} variant="text" width={100} height={18} />
							<Skeleton
								{...skeletonProps}
								variant="text"
								width={60}
								height={14}
								style={{ ...skeletonProps.style, marginTop: 4 }}
							/>
						</div>
					</div>
					<div className={classes.profileStatRow}>
						<Skeleton
							{...skeletonProps}
							variant="rect"
							width="48%"
							height={48}
							style={{ ...skeletonProps.style, borderRadius: 8 }}
						/>
						<Skeleton
							{...skeletonProps}
							variant="rect"
							width="48%"
							height={48}
							style={{ ...skeletonProps.style, borderRadius: 8 }}
						/>
					</div>
				</div>
			</div>
			<Skeleton
				{...skeletonProps}
				variant="rect"
				width="100%"
				height={300}
				style={{ ...skeletonProps.style, borderRadius: 16 }}
			/>
		</div>
	);
}

function AchievementSkeleton() {
	const classes = useSkeletonStyles();
	return (
		<div>
			<div style={{ padding: '24px 24px 0', display: 'flex', gap: 8 }}>
				{Array.from({ length: 4 }).map((_, i) => (
					<Skeleton
						key={i}
						{...skeletonProps}
						variant="rect"
						width={80}
						height={32}
						style={{ ...skeletonProps.style, borderRadius: 16 }}
					/>
				))}
			</div>
			<div className={classes.achievementGrid}>
				{Array.from({ length: 6 }).map((_, i) => (
					<div key={i} className={classes.achievementCard}>
						<div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
							<Skeleton {...skeletonProps} variant="circle" width={40} height={40} />
							<div style={{ flex: 1 }}>
								<Skeleton {...skeletonProps} variant="text" width="60%" height={18} />
								<Skeleton
									{...skeletonProps}
									variant="text"
									width="40%"
									height={14}
									style={{ ...skeletonProps.style, marginTop: 4 }}
								/>
							</div>
						</div>
						<Skeleton
							{...skeletonProps}
							variant="rect"
							width="100%"
							height={8}
							style={{ ...skeletonProps.style, borderRadius: 4 }}
						/>
					</div>
				))}
			</div>
		</div>
	);
}

function ChampionTableSkeleton() {
	const classes = useSkeletonStyles();
	return (
		<div className={classes.tableContainer}>
			<Skeleton
				{...skeletonProps}
				variant="text"
				width={200}
				height={24}
				style={{ ...skeletonProps.style, marginBottom: 16 }}
			/>
			<div className={classes.tableWrapper}>
				{Array.from({ length: 8 }).map((_, i) => (
					<div key={i} className={classes.tableRow}>
						<Skeleton {...skeletonProps} variant="circle" width={36} height={36} />
						<Skeleton {...skeletonProps} variant="text" width={80} height={18} />
						<Skeleton {...skeletonProps} variant="text" width={50} height={18} />
						<Skeleton {...skeletonProps} variant="text" width={50} height={18} />
						<Skeleton {...skeletonProps} variant="text" width={50} height={18} />
						<Skeleton {...skeletonProps} variant="text" width={60} height={18} />
					</div>
				))}
			</div>
		</div>
	);
}

function SettingsSkeleton() {
	return (
		<div style={{ padding: '24px 28px' }}>
			{Array.from({ length: 5 }).map((_, i) => (
				<div
					key={i}
					style={{
						display: 'flex',
						alignItems: 'center',
						gap: 16,
						padding: '14px 0',
						borderBottom: '1px solid rgba(255, 255, 255, 0.05)'
					}}
				>
					<Skeleton {...skeletonProps} variant="circle" width={32} height={32} />
					<Skeleton {...skeletonProps} variant="text" width="30%" height={18} />
					<div style={{ flex: 1 }} />
					<Skeleton
						{...skeletonProps}
						variant="rect"
						width={80}
						height={28}
						style={{ ...skeletonProps.style, borderRadius: 6 }}
					/>
				</div>
			))}
		</div>
	);
}

export {
	DashboardSkeleton,
	RankingTableSkeleton,
	MatchHistorySkeleton,
	MyInfoSkeleton,
	AchievementSkeleton,
	ChampionTableSkeleton,
	SettingsSkeleton
};
