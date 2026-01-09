
export default function Save( { attributes, setAttributes } ) {
    return (
        <div className="assistant-chat-block">
            <div className='assistant-chat-box'>
                <div className='assistant-box-header'>
                    <h3>AI Assistant</h3>
                    <div className='assistant-box-close'>&times;</div>
                </div>
                <div className='assistant-box-body'></div>
                <div className='assistant-box-form'>
                    <textarea
                    rows="1"
                    className="assistant-input"
                    placeholder={'Type for query'}
                    style={{ resize: 'none' }}
                    />
                </div>
            </div>

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
