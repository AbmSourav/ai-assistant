import { Ollama } from 'ollama'
import { v4 as uuid } from 'uuid';
import { QdrantClient } from "@qdrant/js-client-rest";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";

const ollama = new Ollama({ host: process.env.OLLAMA_API_URL });
const qdrantClient = new QdrantClient({ url: process.env.QDRANT_HOST });

async function dataEmbed(data) {
    return await ollama.embed({
        model: 'embeddinggemma:300m',
        input: data,
    })
}

const storeController = async (req, res) => {
    const data = req.body
    const question = data?.question || ''
    const answer = data?.answer || ''
    const topic = data?.topic || ''
    const description = data?.description || ''
    let input = []

    if (question) {
        input.push("question: " + question)
    }
    if (answer) {
        input.push("answer: " + answer)
    }
    if (topic) {
        input.push("topic: " + topic)
    }
    if (description) {
        input.push("description: " + description)
    }

    // Split the text into chunks
    const spliter = new RecursiveCharacterTextSplitter({
        chunkSize: 500,
        chunkOverlap: 200,
        separators: ["\n\n", "\n", ". ", " ", ""],
    })
    let splitTexts = await spliter.splitText(input.join(" \n "))

    try {
        const ids = []
        const points = []

        if (splitTexts.length > 1) {
            await Promise.all(splitTexts.map(async (text, index) => {
                const match = text.match(/^([.!?])\s*(.*)/)
                if (match && index > 0) {
                    text = match[2]
                }

                const embeddedData = await dataEmbed(text)

                const id = uuid();
                ids.push(id);

                const payload = {}
                if (question) payload.question = question;
                if (topic) payload.topic = topic;
                if (index !== 0) payload.dataChunk = text;

                points.push({
                    id: id,
                    vector: embeddedData.embeddings[0],
                    payload,
                })
            }))
        } else {
            const embeddedData = await dataEmbed(input.join(" \n "))
            const payload = {}
            if (question) payload.question = question;
            if (topic) payload.topic = topic;
            if (answer) payload.answer = answer
            if (description) payload.description = description

            const id = uuid()
            ids.push(id)

            points.push({
                id,
                vector: embeddedData.embeddings[0],
                payload,
            })
        }

        const result = await qdrantClient.upsert("test_assistant", {
            wait: true,
            points: points,
        });

        let getPoints = []
        if (result.status === 'completed' && ids.length > 0) {
            getPoints = await qdrantClient.retrieve("test_assistant", {
                ids: ids,
                with_payload: true,
            });
        }

        return res.status(200).json({
            // points,
            data: getPoints,
            // result
            // data: ids,
        });
    } catch (error) {
        console.error('Full error details:', error);
        res.status(500).json({
            status: 'Error',
            message: error.message,
            details: error.toString()
        });
    }
}

export default storeController;
