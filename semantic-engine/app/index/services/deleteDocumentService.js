import { QdrantClient } from "@qdrant/js-client-rest";

import { PointDeleteParamsSchema } from "../../types/point.js";

const qdrantClient = new QdrantClient({ url: process.env.QDRANT_HOST })

const deleteDocumentService = async (req) => {
    const validate = PointDeleteParamsSchema.safeParse(req.body)
    if (!validate?.success) {
        return res.status(422).json({error: validate.error})
    }

    const { parentId } = validate.data

    const filter = {
        should: [
            {
                key: "parentId",
                match: {
                    value: parentId,
                }
            },
            {
                has_id: [parentId]
            }
        ]
    }

    try {
        return await qdrantClient.delete(process.env.COLLECTION_NAME, {
            wait: true,
            filter: filter,
        });
    } catch (error) {
        console.error('Full error details:', error);
        return res.status(500).json({
            status: 'Error',
            message: error.message,
            details: error.toString()
        });
    }
}

export default deleteDocumentService
