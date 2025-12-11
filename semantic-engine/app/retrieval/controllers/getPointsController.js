import ollama from 'ollama'
import { QdrantClient } from "@qdrant/js-client-rest";

const qdrantClient = new QdrantClient({ url: process.env.QDRANT_HOST });

const getPointsController = async (req, res) => {
    const ids = req?.query?.ids?.split(',').map(id => id.trim());

    try {
        const result = await qdrantClient.retrieve("assistant", {
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
