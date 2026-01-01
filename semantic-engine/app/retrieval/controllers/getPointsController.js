import { QdrantClient } from "@qdrant/js-client-rest";
import { GetPointParamsSchema } from "../../types/point.js";

const qdrantClient = new QdrantClient({ url: process.env.QDRANT_HOST });

const getPointsController = async (req, res) => {
    const validate = GetPointParamsSchema.safeParse(req.query)
    if (!validate?.success) {
        return res.status(422).json({error: validate.error})
    }

    const ids = validate.data.ids?.split(',').map(id => id.trim());

    try {
        const result = await qdrantClient.retrieve(process.env.COLLECTION_NAME, {
            ids,
            with_payload: true
        });
        res.json({ data: result });
    } catch (error) {
        console.error('Error querying Qdrant:', error);
        res.status(500).json({
            status: 'Error',
            message: error.message,
            details: error.toString()
        });
    }
}

export default getPointsController;
