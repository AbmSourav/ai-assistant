import { __experimentalInputControl as InputControl, Button, TextareaControl, Notice, Spinner } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useState, useContext } from 'react';

import { AppStore } from '../store';
import { useEffect } from 'react';

const IndexForm = () => {
    const { store, setStore } = useContext(AppStore);

    const [ title, setTitle ] = useState('');
    const [ details, setDetails ] = useState('');
    const [ isSubmitting, setIsSubmitting ] = useState(false);
    const [ notice, setNotice ] = useState({ show: false, type: '', message: '' });
    const [ submitButtonText, setSubmitButtonText ] = useState(__('Store', 'assistant-interface'));

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
            formData.append('header', title);
            formData.append('detail', details.replace(/\n/g, "\n"));
            if (store.editDocumentId) {
                formData.append('parentId', store.editDocumentId);
            }

            const response = await fetch(aiAssistantData.ajaxUrl, {
                method: 'POST',
                body: formData
            });

            const res = await response.json();

            if (res.success) {
                setNotice({
                    show: true,
                    type: 'success',
                    message: res.data.message
                });
                setTitle('');
                setDetails('');
                // Trigger list refresh and close modal
                setStore(prevStore => ({
                    ...prevStore,
                    updateList: Date.now(),
                    editDocumentId: null
                }));
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

    useEffect(() => {
        setTitle(store.documentHeader || '');
        setDetails(store.documentDetails || '');
        if (store.editDocumentId) {
            setSubmitButtonText(__('Update', 'assistant-interface'));
        }
    }, [store.documentDetails]);

    if (store?.editDocumentId && !store?.documentDetails) {
        return <Spinner />;
    }

    return (
        <>
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
                        rows={12}
                        disabled={isSubmitting}
                    />
                </div>

                <div>
                    <Button
                        variant='primary'
                        type='submit'
                        disabled={isSubmitting}
                        isBusy={isSubmitting}
                        className='!px-12 !py-6 !text-[18px] !bg-[#099a5f] hover:!bg-[#087a4d]'
                    >
                        {isSubmitting ? __('Processing...', 'assistant-interface') : submitButtonText}
                    </Button>
                </div>
            </form>
        </>
    );
};

export default IndexForm;
