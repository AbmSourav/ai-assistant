import { useBlockProps } from '@wordpress/block-editor';

export default function Edit( { attributes, setAttributes } ) {
    const blockProps = useBlockProps({
        className: 'assistant-chat-block-editor'
    });

    return (
        <div {...blockProps}>
            <div className='assistant-chat'>
                <img
                src={ attributes.pluginUrl + '/resources/block/images/chat.png' }
                alt="Chat Block Placeholder"
                style={ { width: '50px', height: 'auto' } }
                />
            </div>
        </div>
    );
}
