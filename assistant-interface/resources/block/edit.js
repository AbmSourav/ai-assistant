import { useBlockProps } from '@wordpress/block-editor';

export default function Edit( { attributes: { message }, setAttributes } ) {
    const blockProps = useBlockProps({
        className: 'assistant-chat-block-editor'
    });

    return (
        <div {...blockProps}>
            Hello
        </div>
    );
}
