import { QdrantClient } from "@qdrant/js-client-rest"
import { chat, chatSummary, dataEmbed } from '../../helpers/utilities.js'
import { getPromptHistory, setRagContext, setSummaryContext, setUserQuery } from "../services/prompt-augmentation.js";
import { RetriveSchema } from "../../types/point.js";

const qdrantClient = new QdrantClient({ url: process.env.QDRANT_HOST })

const retrievalController = async (req, res) => {
    const validate = RetriveSchema.safeParse(req.body)
    if (!validate?.success) {
        return res.status(422).json({error: validate.error})
    }

    const { userQuery, previousSummary } = validate.data
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

		// if score is less than a threshold, return no relevant data found
		const relevantPoints = result.points.filter(point => point.score >= 0.3);
		if (relevantPoints.length === 0) {
			return res.status(200).json({
				data: null,
				message: "No relevant data found."
			});
		}

		// generate the context using retrieval data and user's query
        setRagContext(result.points)
        setUserQuery(userQuery)
		setSummaryContext(previousSummary)
		const generatedRes = await chat()

		let summary = ''
		if (generatedRes?.message) {
			summary = await chatSummary({
				query: userQuery,
				previousSummary: previousSummary,
				generatedContent: generatedRes?.message?.content
			})
		}

        res.status(200).json({
            results: generatedRes,
            summary,
            // result,
            // result: getPromptHistory()
        });
    } catch (error) {
        console.error (error)
        throw new Error(error)
    }
}

export default retrievalController;
