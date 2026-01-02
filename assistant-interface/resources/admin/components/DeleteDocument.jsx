import { useState, useContext } from 'react';
import { Button, Modal, Spinner } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

import { AppStore } from '../store';

const DeleteDocument = () => {
    const { store, setStore } = useContext(AppStore);
    const [ isSubmitting, setIsSubmitting ] = useState(false);

    const handleCancel = () => {
        setStore(prevStore => ({
            ...prevStore,
            deleteDocId: null,
        }));
    }

    const handleDeleteDocument = async () => {
        setIsSubmitting(true);

        const formData = new FormData()
        formData.append('action', 'deleteDocument')
        formData.append('nonce', aiAssistantData.nonce)
        formData.append('parentId', store?.deleteDocId)

        try {
            const response = await fetch(aiAssistantData.ajaxUrl, {
                method: 'POST',
                body: formData,
            });
            const res = await response.json();
            console.log('document delete response:', res);

            if (res.success) {
                setStore(prevStore => ({
                    ...prevStore,
                    updateList: Date.now()
                }));
            }
        } catch (err) {
            console.error('Error fetching document details:', err)
        }
        finally {
            setIsSubmitting(false);
            handleCancel();
        }
    }

    if (!store?.deleteDocId) {
        return null;
    }

    return (
        <Modal
        className='!w-[40vw] flex flex-col justify-center items-center p-6'
        title={__('Are you sure?', 'assistant-interface')}
        onRequestClose={handleCancel}
        >
            <h4 className='text-gray-500'>{__('Are you sure you want to delete this document?', 'assistant-interface')}</h4>
            <div className='flex justify-center items-center'>
                <Button className='!mr-4 !py-6 !px-10' variant="secondary" onClick={handleCancel}>
                    {__('Cancel', 'assistant-interface')}
                </Button>
                <Button variant="primary" className="!py-6 !px-10" onClick={handleDeleteDocument} disabled={isSubmitting}>
                    {isSubmitting ? <Spinner /> : 'Delete'}
                </Button>
            </div>
        </Modal>
    );
}

export default DeleteDocument;
