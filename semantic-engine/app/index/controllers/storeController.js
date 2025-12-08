import { Ollama } from 'ollama'
import { v4 as uuid } from 'uuid';
import { QdrantClient } from "@qdrant/js-client-rest";

const ollama = new Ollama({ host: process.env.OLLAMA_API_URL });
const qdrantClient = new QdrantClient({ url: process.env.QDRANT_HOST });

const storeController = async (req, res) => {
    const data = req.body
    const question = data?.question || ''
    const answer = data?.answer || ''
    const info = data?.text || ''
    let input = []
    const payload = {}

    if (question) {
        payload.question = question
        input.push("question: " + question)
    }
    if (answer) {
        payload.answer = answer
        input.push("answer: " + answer)
    }
    if (info) {
        payload.info = info
        input.push("info: " + info)
    }

    try {
        const embeddedData = await ollama.embed({
            model: 'embeddinggemma:300m',
            input: input,
        })

        const points = [
            {
                id: uuid(),
                vector: embeddedData.embeddings[0],
                payload,
            },
        ];

        const result = await qdrantClient.upsert("assistant", {
            wait: true,
            points: points,
        });
        result.id = points[0].id;

        return res.status(200).json({
            // vectorDimensions: embeddedData,
            data: result
        });
    } catch (error) {
        console.error('Full error details:', error);
        console.error('Error stack:', error.stack);
        res.status(500).json({
            status: 'Error',
            message: error.message,
            details: error.toString()
        });
    }
}

export default storeController;
