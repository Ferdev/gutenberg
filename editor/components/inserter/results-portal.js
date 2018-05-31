/**
 * WordPress dependencies
 */
import { createSlotFill, PanelBody } from '@wordpress/components';

/**
 * Internal dependencies
 */
import ItemList from './item-list';

const { Fill, Slot } = createSlotFill( 'InserterResultsPortal' );

const InserterResultsPortal = ( { items, title, onSelect } ) => {
	return (
		<Fill>
			<PanelBody
				title={ title }
			>
				<ItemList items={ items } onSelect={ onSelect } onHover={ () => {} } />
			</PanelBody>
		</Fill>
	);
};

InserterResultsPortal.Slot = Slot;

export default InserterResultsPortal;
