import { v4 as uuid } from 'uuid';
import { QdrantClient } from "@qdrant/js-client-rest";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import moment from 'moment';

import { dataEmbed, preparePoint } from '../../helpers/utilities.js';
import { PointStoreParamsSchema } from '../../types/point.js';

const qdrantClient = new QdrantClient({ url: process.env.QDRANT_HOST })

const createDocumentService = async (req, res) => {
    const validatedData = PointStoreParamsSchema.safeParse(req.body)
    if (!validatedData?.success) {
        return res.status(422).json({error: validatedData.error}, )
    }

    const { header, detail } = validatedData.data

    // Split the text into chunks
    const spliter = new RecursiveCharacterTextSplitter({
        chunkSize: 600,
        chunkOverlap: 200,
        separators: ["\n\n", "\n", ". ", " ", ""],
    })
    let splitTexts = await spliter.splitText(header + " \n\n " + detail)

    const ids = []
    const points = []
    const collectionName = process.env.COLLECTION_NAME

	const timestamp = moment().toISOString()
    if (splitTexts.length > 1) {
        await Promise.all(splitTexts.map(async (text, index) => {
            const match = text.match(/^([.!?])\s*(.*)/)
            if (match && index > 0) {
                text = match[2]
            }

            const id = uuid();
            ids.push(id);

            const payload = {
                header,
                timestamp
            }
            if (index !== 0) {
                payload.dataChunk = text;
                payload.parentId = ids[0]
                payload.childIndex = index
            }

            const embeddedData = await dataEmbed(text)

            points.push(preparePoint({
                id,
                vector: embeddedData.embeddings[0],
                payload,
                index
            }))
        }))
    } else {
        const embeddedData = await dataEmbed(header + " \n " + detail)
        const payload = {
            header,
            detail,
            timestamp
        }

        const id = uuid()
        ids.push(id)

        points.push(preparePoint({
            id,
            vector: embeddedData.embeddings[0],
            payload
        }))
    }

    try {
        const result = await qdrantClient.upsert(collectionName, {
            wait: true,
            points: points,
        });

        let getPoints = []
        if (result?.status === 'completed' && ids.length > 0) {
            getPoints = await qdrantClient.retrieve(collectionName, {
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

export default createDocumentService
