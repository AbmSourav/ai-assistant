import { QdrantClient } from "@qdrant/js-client-rest";

import { GetDocumentsParamsSchema } from "../../types/point.js";

const qdrantClient = new QdrantClient({ url: process.env.QDRANT_HOST });

const setPaginationData = async ({ page = 1, limit = 10 }) => {
    const collectionInfo = await qdrantClient.getCollection(process.env.COLLECTION_NAME);
    const totalPoints = collectionInfo.points_count;
    const totalPages = Math.ceil(totalPoints / limit);

    return {
        pagination: {
            currentPage: page,
            perPage: limit,
            totalPoints,
            totalPages,
            hasNextPage: page < totalPages,
            hasPreviousPage: page > 1,
        }
    };
}

const getDocumentsController = async (req, res) => {
    const validate = GetDocumentsParamsSchema.safeParse(req.query);
    if (!validate?.success) {
        return res.json({ error: validate.error });
    }

    const { page, limit } = validate.data;
    const offset = (page - 1) * limit;

    try {
        const result = await qdrantClient.scroll("test_assistant", {
            limit,
            offset,
            with_payload: true,
        });

        const pagination = await setPaginationData({ page, limit })

        res.json({
            data: result.points,
            ...pagination
        });
    } catch (error) {
        console.error('Error querying Qdrant:', error);
        res.status(500).json({
            status: 'Error',
            message: error.message,
            details: error.toString()
        });
    }
}

export default getDocumentsController;
