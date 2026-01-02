import { registerBlockType } from '@wordpress/blocks';

import metadata from './block.json';
import Edit from './edit';
import Save from './save';
import './style.css';

registerBlockType( metadata.name, {
	edit: Edit,
	save: Save,
} );
