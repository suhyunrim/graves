import FuseAnimate from '@fuse/core/FuseAnimate';
import FuseSplashScreen from '@fuse/core/FuseSplashScreen';
import { useForm } from '@fuse/hooks';
import Button from '@material-ui/core/Button';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import { makeStyles } from '@material-ui/core/styles';
import { darken } from '@material-ui/core/styles/colorManipulator';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import clsx from 'clsx';
import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import * as authActions from 'app/auth/store/actions';

const useStyles = makeStyles(theme => ({
	root: {
		background: `radial-gradient(${darken(theme.palette.primary.dark, 0.5)} 0%, ${theme.palette.primary.dark} 80%)`,
		color: theme.palette.primary.contrastText
	}
}));

function LoginPage() {
	const classes = useStyles();
	const dispatch = useDispatch();

	const { form, handleChange, resetForm } = useForm({
		riotId: ''
	});

	const isPending = useSelector(({ auth }) => auth.login.isPending);

	function isFormValid() {
		return form.riotId.length > 0 && form.riotId.includes('#');
	}

	function handleSubmit(ev) {
		dispatch(authActions.submitLogin(form));
		ev.preventDefault();
		resetForm();
	}

	if (isPending) return <FuseSplashScreen />;

	return (
		<div className={clsx(classes.root, 'flex flex-col flex-auto flex-shrink-0 items-center justify-center p-32')}>
			<div className="flex flex-col items-center justify-center w-full">
				<FuseAnimate animation="transition.expandIn">
					<Card className="w-full max-w-384">
						<CardContent className="flex flex-col items-center justify-center p-32">
							<img className="w-128 m-32" src="assets/images/logos/logo.png" alt="logo" />

							<Typography variant="h6" className="mt-16 mb-32">
								LOGIN TO YOUR ACCOUNT
							</Typography>

							<form name="loginForm" noValidate className="flex flex-col justify-center w-full" onSubmit={handleSubmit}>
								<TextField
									className="mb-16"
									label="Nickname#TAG"
									placeholder="Nickname#TAG"
									autoFocus
									name="riotId"
									value={form.riotId}
									onChange={handleChange}
									variant="outlined"
									required
									fullWidth
								/>

								<Button
									variant="contained"
									color="primary"
									className="w-224 mx-auto mt-16"
									aria-label="LOG IN"
									disabled={!isFormValid()}
									type="submit"
								>
									LOGIN
								</Button>
							</form>
						</CardContent>
					</Card>
				</FuseAnimate>
			</div>
		</div>
	);
}

export default LoginPage;
