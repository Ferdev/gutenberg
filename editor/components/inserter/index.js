/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { Dropdown, IconButton } from '@wordpress/components';
import { createBlock, isUnmodifiedDefaultBlock } from '@wordpress/blocks';
import { Component, compose } from '@wordpress/element';
import { withSelect, withDispatch } from '@wordpress/data';

/**
 * Internal dependencies
 */
import InserterMenu from './menu';

export { default as InserterResultsPortal } from './results-portal';

class Inserter extends Component {
	constructor() {
		super( ...arguments );

		this.onToggle = this.onToggle.bind( this );
		this.isInsertingInline = this.isInsertingInline.bind( this );
		this.showInsertionPoint = this.showInsertionPoint.bind( this );
		this.hideInsertionPoint = this.hideInsertionPoint.bind( this );
		this.state = { isInline: false };
	}

	onToggle( isOpen ) {
		const { onToggle } = this.props;

		if ( isOpen ) {
			this.showInsertionPoint();
		} else {
			this.hideInsertionPoint();
		}

		// Surface toggle callback to parent component
		if ( onToggle ) {
			onToggle( isOpen );
		}
	}

	showInsertionPoint() {
		const { showInlineInsertionPoint, showInsertionPoint } = this.props;

		if ( this.isInsertingInline() ) {
			this.setState( { isInline: true } );
			showInlineInsertionPoint();
		} else {
			this.setState( { isInline: false } );
			showInsertionPoint();
		}
	}

	hideInsertionPoint() {
		const { hideInlineInsertionPoint, hideInsertionPoint } = this.props;

		if ( this.state.isInline ) {
			hideInlineInsertionPoint();
		} else {
			hideInsertionPoint();
		}
	}

	isInsertingInline() {
		const { selectedBlock, canInsertInline } = this.props;

		return selectedBlock &&
			! isUnmodifiedDefaultBlock( selectedBlock ) &&
			canInsertInline;
	}

	render() {
		const {
			items,
			position,
			title,
			children,
			onInsertBlock,
			rootUID,
			onInsertInline,
		} = this.props;
		const { isInline } = this.state;

		if ( items.length === 0 ) {
			return null;
		}

		return (
			<Dropdown
				className="editor-inserter"
				contentClassName="editor-inserter__popover"
				position={ position }
				onToggle={ this.onToggle }
				expandOnMobile
				headerTitle={ title }
				renderToggle={ ( { onToggle, isOpen } ) => (
					<IconButton
						icon="insert"
						label={ __( 'Add block' ) }
						onClick={ onToggle }
						className="editor-inserter__toggle"
						aria-haspopup="true"
						aria-expanded={ isOpen }
					>
						{ children }
					</IconButton>
				) }
				renderContent={ ( { onClose } ) => {
					const onSelect = ( item ) => {
						if ( isInline ) {
							onInsertInline( item );
						} else {
							onInsertBlock( item );
						}

						onClose();
					};
					return <InserterMenu items={ items } onSelect={ onSelect } rootUID={ rootUID } isInline={ isInline } />;
				} }
			/>
		);
	}
}

export default compose( [
	withSelect( ( select ) => {
		const {
			getEditedPostAttribute,
			getBlockInsertionPoint,
			getSelectedBlock,
			getInserterItems,
			isInlineInsertAvailable,
		} = select( 'core/editor' );
		const insertionPoint = getBlockInsertionPoint();
		const { rootUID } = insertionPoint;
		return {
			title: getEditedPostAttribute( 'title' ),
			insertionPoint,
			selectedBlock: getSelectedBlock(),
			items: getInserterItems( rootUID ),
			rootUID,
			canInsertInline: isInlineInsertAvailable(),
		};
	} ),
	withDispatch( ( dispatch, ownProps ) => ( {
		showInsertionPoint: dispatch( 'core/editor' ).showInsertionPoint,
		hideInsertionPoint: dispatch( 'core/editor' ).hideInsertionPoint,
		onInsertBlock: ( item ) => {
			const { insertionPoint, selectedBlock } = ownProps;
			const { index, rootUID, layout } = insertionPoint;
			const { name, initialAttributes } = item;
			const insertedBlock = createBlock( name, { ...initialAttributes, layout } );
			if ( selectedBlock && isUnmodifiedDefaultBlock( selectedBlock ) ) {
				return dispatch( 'core/editor' ).replaceBlocks( selectedBlock.uid, insertedBlock );
			}
			return dispatch( 'core/editor' ).insertBlock( insertedBlock, index, rootUID );
		},
		showInlineInsertionPoint: dispatch( 'core/editor' ).showInlineInsertionPoint,
		hideInlineInsertionPoint: dispatch( 'core/editor' ).hideInlineInsertionPoint,
		onInsertInline: dispatch( 'core/editor' ).insertInline,
	} ) ),
] )( Inserter );
