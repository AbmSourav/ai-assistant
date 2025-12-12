import deleteDocumentService from "../services/deleteDocumentService.js";

const deleteController = async (req, res) => {
    const result = await deleteDocumentService(req)

    return res.status(200).json({
        data: result
    });
}

export default deleteController;
