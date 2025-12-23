import { __experimentalInputControl as InputControl, Button, TextareaControl, Notice } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useState } from 'react';

const IndexForm = () => {
    const [ title, setTitle ] = useState('');
    const [ details, setDetails ] = useState('');
    const [ isSubmitting, setIsSubmitting ] = useState(false);
    const [ notice, setNotice ] = useState({ show: false, type: '', message: '' });

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!title.trim() || !details.trim()) {
            setNotice({
                show: true,
                type: 'error',
                message: __('Please fill in both title and details fields.', 'assistant-interface')
            });
            return;
        }

        setIsSubmitting(true);
        setNotice({ show: false, type: '', message: '' });

        try {
            const formData = new FormData();
            formData.append('action', 'handleIndexData');
            formData.append('nonce', aiAssistantData.nonce);
            formData.append('title', title);
            formData.append('details', details);

            const response = await fetch(aiAssistantData.ajaxUrl, {
                method: 'POST',
                body: formData
            });

            const res = await response.json();
            console.log("res::", res)

            if (res.success) {
                setNotice({
                    show: true,
                    type: 'success',
                    message: res.data.message
                });
                setTitle('');
                setDetails('');
            } else {
                setNotice({
                    show: true,
                    type: 'error',
                    message: res.data.message || __('Something went wrong!', 'assistant-interface')
                });
            }
        } catch (error) {
            setNotice({
                show: true,
                type: 'error',
                message: __('Failed to submit data. Please try again.', 'assistant-interface')
            });
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <div className='max-w-[800px] mx-auto p-6'>
            <h2 className='text-2xl font-bold mb-6'>{__('Create Knowledge Base', 'assistant-interface')}</h2>

            {notice.show && (
                <Notice
                    status={notice.type}
                    isDismissible={true}
                    onRemove={() => setNotice({ show: false, type: '', message: '' })}
                    className='mb-4'
                >
                    {notice.message}
                </Notice>
            )}

            <form onSubmit={handleSubmit} className='space-y-4'>
                <div>
                    <label className='block mb-2 font-medium'>
                        {__('Title', 'assistant-interface')}
                    </label>
                    <InputControl
                        __next40pxDefaultSize
                        value={title}
                        onChange={(nextValue) => setTitle(nextValue ?? '')}
                        placeholder={__('Enter title, topic, or question', 'assistant-interface')}
                        disabled={isSubmitting}
                    />
                </div>

                <div className='mt-6'>
                    <label className='block mb-2 font-medium'>
                        {__('Details', 'assistant-interface')}
                    </label>
                    <TextareaControl
                        value={details}
                        onChange={(nextValue) => setDetails(nextValue)}
                        placeholder={__('Enter detailed information or answer', 'assistant-interface')}
                        rows={8}
                        disabled={isSubmitting}
                    />
                </div>

                <div>
                    <Button
                        variant='primary'
                        type='submit'
                        disabled={isSubmitting}
                        isBusy={isSubmitting}
                        className='!px-8 !py-5 !text-[18px]'
                    >
                        {isSubmitting ? __('Processing...', 'assistant-interface') : __('Store', 'assistant-interface')}
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default IndexForm;
