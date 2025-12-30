import { QdrantClient } from "@qdrant/js-client-rest";
import moment from "moment";

import { GetDocumentsParamsSchema } from "../../types/point.js";

const qdrantClient = new QdrantClient({ url: process.env.QDRANT_HOST });

const getDocumentsController = async (req, res) => {
    const validate = GetDocumentsParamsSchema.safeParse(req.query);
    if (!validate?.success) {
        return res.json({ error: validate.error });
    }

    const { limit, startFrom } = validate.data

    try {
        const fetchLimit = limit + 1;	// Fetch one extra document to check if there's a next page

        const queryOptions = {
            limit: fetchLimit,
			order_by: {
				key: 'timestamp',
				direction: 'desc'
			},
            with_payload: true,
			filter: {
				must: [
					{
						is_empty: {
							key: "parentId"
						}
					}
				]
			}
        };

        if (startFrom) {
            queryOptions.order_by.start_from = startFrom;
        }

        const result = await qdrantClient.scroll(process.env.COLLECTION_NAME, queryOptions);

        const hasMore = result.points.length > limit;	// Check if there are more pages
        const documents = hasMore ? result.points.slice(0, limit) : result.points;	// Get only the requested number of documents

        // Extract cursor (timestamp) from the last document for next page
		let nextCursor = null
		if (hasMore && documents.length > 0) {
			const lastTimestamp = documents[documents.length - 1].payload.timestamp
			nextCursor = moment(lastTimestamp).add(-1, 'ms').toISOString()
		}

        res.json({
            data: documents,
            pagination: {
                nextCursor,
                count: documents.length
            }
        });
    } catch (error) {
        console.error('Error querying Qdrant:', error);
        res.status(500).json({
            status: 'Error',
            message: error.message,
            details: error.toString()
        });
    }
}

export default getDocumentsController;
