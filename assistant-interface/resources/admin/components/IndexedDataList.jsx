import { useEffect, useState, useContext } from 'react';
import { Panel, PanelBody, PanelRow, Spinner } from '@wordpress/components';
import { Icon, trash, pencil } from '@wordpress/icons';

import { AppStore } from '../store';
import EditDocument from './EditDocument';
import DeleteDocument from './DeleteDocument';

const IndexedDataList = () => {
    const { store, setStore } = useContext(AppStore);
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [documentDetails, setDocumentDetails] = useState({});

    const truncateTitle = (title, maxChars = 100) => {
        if (title.length <= maxChars) {
            return title;
        }
        const truncated = title.slice(0, maxChars);
        const lastSpaceIndex = truncated.lastIndexOf(' ');
        if (lastSpaceIndex > 0) {
            return truncated.slice(0, lastSpaceIndex) + '... ..';
        }
        return truncated + '... ..';
    };

    const fetchDocuments = async () => {
        setLoading(true);
        const formData = new FormData();
        formData.append('action', 'getDocuments');
        formData.append('nonce', aiAssistantData.nonce);

        try {
            const response = await fetch(aiAssistantData.ajaxUrl, {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();
            console.log('documents', data.data)

            if (data.success && data?.data?.points) {
                setDocuments(data.data.points);
            } else {
                setError(data.data || 'Failed to fetch documents');
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const getDocumentDetails = async (open, docId, modal = false) => {
        if (!open) return
        if (documentDetails[docId]) return // Already fetched, so get cached data

        const formData = new FormData()
        formData.append('action', 'getDocumentDetails')
        formData.append('nonce', aiAssistantData.nonce)
        formData.append('id', docId)

        try {
            const response = await fetch(aiAssistantData.ajaxUrl, {
                method: 'POST',
                body: formData,
            });
            const data = await response.json();
            console.log('document details response:', data)

            setDocumentDetails(prev => ({ ...prev, [docId]: data.data.details }))

            console.log('fetch details:', data)
            store.documentHeader = data.data.header
            store.documentDetails = data.data.details
            if (modal) {
                store.editDocumentId = docId
            }

            setStore({...store})
        } catch (err) {
            console.error('Error fetching document details:', err)
        };
    }

    const handleEditDocument = async (id) => {
        setStore({ ...store, editDocumentId: id })
        await getDocumentDetails(true, id, true)
    }

    useEffect(() => {
        fetchDocuments();
    }, [store?.updateList]);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-32 transition-opacity duration-500 ease-in-out opacity-100">
                <Spinner />
            </div>
        );
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    return (
        <div className="transition-opacity duration-500 ease-in-out opacity-100">
            <Panel>
                {documents.length === 0 ? (
                    <div className="transition-opacity duration-300 ease-in-out opacity-100">No documents found</div>
                ) : (
                    documents.map((doc) => (
                        <>
                        <div className='relative transition-all duration-300 ease-in-out opacity-100' key={doc.id}>
                            <div>
                                <button
                                className="absolute cursor-pointer z-1 top-3 right-20 rounded-full bg-gray-200 hover:bg-sky-400 transition-all duration-200 ease-in-out"
                                onClick={async () => await handleEditDocument(doc.id)}
                                >
                                    <Icon icon={ pencil } />
                                </button>
                                <button
                                className="absolute cursor-pointer z-1 top-3 right-12 rounded-full bg-gray-200 hover:bg-sky-400 transition-all duration-200 ease-in-out"
                                onClick={() => setStore(prevStore => ({ ...prevStore, deleteDocId: doc.id }))}
                                >
                                    <Icon icon={ trash } />
                                </button>
                            </div>
                            <PanelBody
                            onToggle={(toggle) => getDocumentDetails(toggle, doc.id)}
                            title={truncateTitle(doc.payload.header)} initialOpen={ false }
                            className='!border-t-[0] transition-all duration-300 ease-in-out'
                            >
                                <PanelRow className='flex-col'>
                                    <hr className='w-[97%] mb-3 transition-opacity duration-200 ease-in-out' />
                                    <div className='text-xs/5 px-3 mb-3 min-h-[100px] transition-opacity duration-500 ease-in-out'>
                                        <div className="inline-block transition-opacity duration-500 ease-in-out opacity-100 whitespace-pre-line">
                                            {documentDetails[doc.id]}
                                        </div>
                                    </div>
                                </PanelRow>
                            </PanelBody>
                        </div>
                        </>
                    ))
                )}
            </Panel>

            {/* Document edit modal */}
            <EditDocument />
            {/* Document delete modal */}
            <DeleteDocument />
        </div>
    );
};

export default IndexedDataList;
