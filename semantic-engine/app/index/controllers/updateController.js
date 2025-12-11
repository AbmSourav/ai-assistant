import { v4 as uuid } from 'uuid';
import { QdrantClient } from "@qdrant/js-client-rest"
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters"

import dataEmbed from '../../helpers/utilities.js'

const qdrantClient = new QdrantClient({ url: process.env.QDRANT_HOST })

const handleRequest = async (point) => {
    const question = point?.question || ''
    const answer = point?.answer || ''
    const topic = point?.topic || ''
    const description = point?.description || ''
    let input = []

    if (question) {
        input.push(question)
    }
    if (answer) {
        input.push(answer)
    }
    if (topic) {
        input.push(topic)
    }
    if (description) {
        input.push(description)
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

                const id = index === 0 ? point.id : uuid();
                ids.push(id);

                const payload = {}
                if (question) payload.question = question;
                if (topic) payload.topic = topic;
                if (index !== 0) payload.dataChunk = text;
                if (index !== 0) {
                    payload.relevantId = ids[0]
                }

                const embeddedData = await dataEmbed(text)

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

            ids.push(point.id)

            points.push({
                id: point.id,
                vector: embeddedData.embeddings[0],
                payload,
            })
        }

        return {ids, points}

    } catch (error) {
        console.error('Full error details:', error);
        res.status(500).json({
            status: 'Error',
            message: error.message,
            details: error.toString()
        });
    }
};

const updateController = async (req, res) => {
    const data = req.body

    const ids = []
    const points = []
    let getPoints = []
    let result = []

    await Promise.all(data.map(async (point, index) => {
        const updatedPoint = await handleRequest(point)
        ids.push(...updatedPoint.ids)
        points.push(...updatedPoint.points)
    }))

    if (points.length > 0) {
        result = await qdrantClient.upsert("test_assistant", {
            wait: true,
            points: points,
        });

        if (result?.status === 'completed') {
            getPoints = await qdrantClient.retrieve("test_assistant", {
                ids: ids,
                with_payload: true,
            });
        }
    }

    res.json({ ids })
}

export default updateController;
