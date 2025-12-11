import { Ollama } from 'ollama'
import { QdrantClient } from "@qdrant/js-client-rest"

const ollama = new Ollama({ host: process.env.OLLAMA_API_URL })
const qdrantClient = new QdrantClient({ url: process.env.QDRANT_HOST })

const retrievalController = async (req, res) => {
    const data = req.body;

    const embeddedData = await ollama.embed({
        model: 'embeddinggemma:300m',
        input: data?.query,
    })

    if (!embeddedData || !embeddedData?.embeddings || embeddedData.embeddings?.length == 0) {
        return res.status(400).json({
            status: 'Error',
            message: 'Failed to generate embeddings',
        });
    }

    const result = await qdrantClient.query("assistant", {
        query: embeddedData.embeddings[0],
        limit: 3,
        with_payload: true,
    });

    res.status(200).json({
        results: result,
    });
}

export default retrievalController;
