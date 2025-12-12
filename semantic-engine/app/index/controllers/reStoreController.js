import createDocumentService from '../services/createDocumentService.js';
import deleteDocumentService from '../services/deleteDocumentService.js';

const reStoreController = async (req, res) => {
    await deleteDocumentService(req)
    
    return await createDocumentService(req, res)
}

export default reStoreController;
