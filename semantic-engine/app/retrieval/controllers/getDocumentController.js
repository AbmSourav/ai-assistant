import { QdrantClient } from "@qdrant/js-client-rest";
import { GetPointParamsSchema } from "../../types/point.js";

const qdrantClient = new QdrantClient({ url: process.env.QDRANT_HOST });

const getDocumentController = async (req, res) => {
    const validate = GetPointParamsSchema.safeParse(req.query)
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
        const result = await qdrantClient.scroll(process.env.COLLECTION_NAME, {
            filter,
            with_payload: true,
            with_vector: false,
            limit: 100
        });
        res.json({ data: result.points });
    } catch (error) {
        console.error('Error querying Qdrant:', error);
        res.status(500).json({
            status: 'Error',
            message: error.message,
            details: error.toString()
        });
    }
}

export default getDocumentController;
