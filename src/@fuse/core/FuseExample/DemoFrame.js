import { ThemeProvider, StyledEngineProvider } from '@mui/material/styles';
import createGenerateClassName from '@mui/styles/createGenerateClassName';
import jssPreset from '@mui/styles/jssPreset';
import StylesProvider from '@mui/styles/StylesProvider';
import { withStyles } from 'tss-react/mui';
import { create } from 'jss';
import jssExtend from 'jss-plugin-extend';
import React from 'react';
import Frame from 'react-frame-component';

const styles = theme => ({
	root: {
		backgroundColor: theme.palette.background.default,
		flexGrow: 1,
		height: 400,
		border: 'none',
		boxShadow: theme.shadows[1]
	}
});

const generateClassName = createGenerateClassName({
	productionPrefix: 'iframe-'
});

class DemoFrame extends React.Component {
	state = {
		ready: false
	};

	handleRef = ref => {
		this.contentDocument = ref ? ref.node.contentDocument : null;
	};

	onContentDidMount = () => {
		this.setState({
			ready: true,
			jss: create({
				...jssPreset(),
				plugins: [...jssPreset().plugins, jssExtend()],
				insertionPoint: this.contentDocument.querySelector('#jss-demo-insertion-point')
			}),
			sheetsManager: new Map(),
			container: this.contentDocument.body
		});
	};

	onContentDidUpdate = () => {
		this.contentDocument.body.dir = this.props.theme.direction;
	};

	renderHead = () => (
		<>
			<style
				dangerouslySetInnerHTML={{
					__html: `
                    html {
                    font-size: 62.5%;
                    font-family: Muli, Roboto, Helvetica Neue, Arial, sans-serif;
                    }
                `
				}}
			/>
			<noscript id="jss-demo-insertion-point" />
		</>
	);

	render() {
		const { children, classes, theme } = this.props;

		return (
            <Frame
				head={this.renderHead()}
				ref={this.handleRef}
				className={classes.root}
				contentDidMount={this.onContentDidMount}
				contentDidUpdate={this.onContentDidUpdate}
			>
                {this.state.ready ? (
					<StylesProvider
						jss={this.state.jss}
						generateClassName={generateClassName}
						sheetsManager={this.state.sheetsManager}
					>
						<StyledEngineProvider injectFirst>
                            <ThemeProvider theme={theme}>
                                {React.cloneElement(children, {
                                    container: this.state.container
                                })}
                            </ThemeProvider>
                        </StyledEngineProvider>
					</StylesProvider>
				) : null}
            </Frame>
        );
	}
}


export default withStyles(styles, { withTheme: true })(DemoFrame);
