import { useContext } from 'react';
import { Modal, Spinner } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

import { AppStore } from '../store';
import IndexForm from './IndexForm';

const EditDocument = ({document}) => {
    const { store, setStore } = useContext(AppStore)

    if (!store?.editDocumentId) {
        return null
    }

    return (
        <Modal className='!w-[60vw]' title="Edit Document" onRequestClose={() => setStore({ ...store, editDocumentId: null })}>
            <div className='px-5'>
                {!store.documentHeader ? <Spinner /> : <IndexForm />}
            </div>
        </Modal>
    )
}

export default EditDocument;
