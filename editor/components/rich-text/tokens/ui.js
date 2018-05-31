/**
 * WordPress dependencies
 */
import { Component, Fragment, compose, renderToString } from '@wordpress/element';
import { withSelect, withDispatch } from '@wordpress/data';
import { withSafeTimeout } from '@wordpress/components';
import { getRectangleFromRange } from '@wordpress/dom';
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import { InserterResultsPortal } from '../../inserter';
import { getTokenSettings } from './registration';

class TokenUI extends Component {
	constructor() {
		super( ...arguments );

		this.onSave = this.onSave.bind( this );
		this.getInsertPosition = this.getInsertPosition.bind( this );

		this.state = {
			selectedToken: null,
		};
	}

	componentDidMount() {
		const { setTimeout, setInsertAvailable } = this.props;

		// When moving between two different RichText with the keyboard, we need to
		// make sure `setInsertAvailable` is called after `setInsertUnavailable`
		// from previous RichText so that editor state is correct
		setTimeout( setInsertAvailable );
	}

	componentWillUnmount() {
		this.props.setInsertUnavailable();
	}

	getInsertPosition() {
		const { containerRef, editor } = this.props;

		// The container is relatively positioned.
		const containerPosition = containerRef.current.getBoundingClientRect();
		const rect = getRectangleFromRange( editor.selection.getRng() );

		return {
			top: rect.top - containerPosition.top,
			left: rect.right - containerPosition.left,
			height: rect.height,
		};
	}

	onSave( { save } ) {
		return ( attributes ) => {
			const { editor } = this.props;

			if ( attributes ) {
				editor.insertContent( renderToString( save( attributes ) ) );
			}

			this.setState( { selectedToken: null } );
		};
	}

	render() {
		const { isInlineInsertionPointVisible } = this.props;
		const { selectedToken } = this.state;

		return (
			<Fragment>
				{ isInlineInsertionPointVisible &&
					<div
						style={ { position: 'absolute', ...this.getInsertPosition() } }
						className="blocks-inline-insertion-point"
					/>
				}
				{ selectedToken &&
					<selectedToken.edit onSave={ this.onSave( selectedToken ) } />
				}
				<InserterResultsPortal
					title={ __( 'Inline Rich Text Tokens' ) }
					items={ Object.values( getTokenSettings() ) }
					onSelect={ ( settings ) => this.setState( { selectedToken: settings } ) }
				/>
			</Fragment>
		);
	}
}

export default compose( [
	withSelect( ( select ) => {
		const {
			isInlineInsertionPointVisible,
		} = select( 'core/editor' );

		return {
			isInlineInsertionPointVisible: isInlineInsertionPointVisible(),
		};
	} ),
	withDispatch( ( dispatch ) => {
		const {
			setInlineInsertAvailable,
			setInlineInsertUnavailable,
		} = dispatch( 'core/editor' );

		return {
			setInsertAvailable: setInlineInsertAvailable,
			setInsertUnavailable: setInlineInsertUnavailable,
		};
	} ),
	withSafeTimeout,
] )( TokenUI );
