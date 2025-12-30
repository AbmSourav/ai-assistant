import { QdrantClient } from "@qdrant/js-client-rest";

const qdrantClient = new QdrantClient({ url: process.env.QDRANT_HOST })

const createCollectionController = async (req, res) => {
	try {
		const collectionName = process.env.COLLECTION_NAME

		const { exists } = await qdrantClient.collectionExists(collectionName);
		if (exists) {
			return res.status(200).json({
				status: 'Info',
				message: `Collection '${collectionName}' already exists.`,
			});
		}

		// Create collection with vector configuration
		await qdrantClient.createCollection(collectionName, {
			vectors: {
				size: 768, // embeddinggemma:300m dimension
				distance: 'Dot'
			},
			on_disk_payload: true
		});

		// Create payload index for timestamp field
		await qdrantClient.createPayloadIndex(collectionName, {
			field_name: "timestamp",
			field_schema: "datetime",
		});

		return res.status(201).json({
			status: 'Success',
			message: `Collection '${collectionName}' created successfully with timestamp index.`
		});
	} catch (error) {
		console.error('Error creating collection:', error);
		return res.status(500).json({
			status: 'Error',
			message: error.message,
			details: error.toString()
		});
	}
}

export default createCollectionController;
