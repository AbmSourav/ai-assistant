import { QdrantClient } from "@qdrant/js-client-rest"
import { chat, dataEmbed } from '../../helpers/utilities.js'
import { getPromptHistory, setRagContext, setUserQuery } from "../services/prompt-augmentation.js";
import { RetriveSchema } from "../../types/point.js";

const qdrantClient = new QdrantClient({ url: process.env.QDRANT_HOST })

const retrievalController = async (req, res) => {
    const validate = RetriveSchema.safeParse(req.body)
    if (!validate?.success) {
        return res.status(422).json({error: validate.error})
    }

    const { userQuery } = validate.data
    const embeddedData = await dataEmbed(userQuery)

    if (!embeddedData || !embeddedData?.embeddings || embeddedData.embeddings?.length == 0) {
        return res.status(400).json({
            status: 'Error',
            message: 'Failed to generate embeddings',
        });
    }

    try {
        const result = await qdrantClient.query(process.env.COLLECTION_NAME, {
            query: embeddedData.embeddings[0],
            limit: 3,
            with_payload: true,
            filter: {
                should: [
                    {
                        must_not: [{
                            is_empty: {
                                key: "parentId",
                            }
                        }],
                    },
                    {
                        must_not: [{
                            is_empty: {
                                key: "detail",
                            }
                        }],
                    },
                ]
            }
        });

        // generate the context using retrieval data and user's query
        setRagContext(result.points)
        setUserQuery(userQuery)

        const generatedRes = await chat()

        res.status(200).json({
            results: generatedRes,
            // result,
            // result: getPromptHistory()
            // test: "hello"
        });
    } catch (error) {
        console.error (error)
        throw new Error(error)
    }
}

export default retrievalController;
